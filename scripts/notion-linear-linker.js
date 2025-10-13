#!/usr/bin/env node
/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')
try {
  // Optional: load .env if present
  require('dotenv').config()
} catch (_) {
  // Ignore missing dotenv; we'll do a manual load below
}
if (!process.env.NOTION_TOKEN || (!process.env.LINEAR_TOKEN && !process.env.LINEAR_API_KEY)) {
  // Manual lightweight loader for .env and development.env
  const candidates = [path.join(process.cwd(), '.env'), path.join(process.cwd(), 'development.env')]
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue
    try {
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
      for (const line of lines) {
        if (!line || line.trim().startsWith('#')) continue
        const idx = line.indexOf('=')
        if (idx === -1) continue
        const key = line.slice(0, idx).trim()
        const value = line.slice(idx + 1).trim()
        if (!process.env[key]) process.env[key] = value
      }
    } catch (_) {}
  }
}
const { NotionHelper } = require('./notion-client')
const { LinearHelper } = require('./linear-client')
const { extractKeyFromTitle, chooseLinearMatchByTitle, withinWindow } = require('./linker-lib')

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const dryRun = !!args['dry-run']
  const projectName = (args.project === true ? 'LUDUS' : args.project) || 'LUDUS'
  const notion = new NotionHelper({ token: process.env.NOTION_TOKEN })
  const linearDefaultTeam = (args.team === true ? 'LDS' : args.team) || 'LDS'
  const linear = new LinearHelper({ token: process.env.LINEAR_TOKEN, teamKey: linearDefaultTeam })

  // Discover Notion resources
  let tasksDb = await discoverDb(notion, process.env.NOTION_TASKS_DB_ID, process.env.NOTION_TASKS_DB_NAME || 'Tasks')
  const sprintsDb = await discoverDb(notion, process.env.NOTION_SPRINTS_DB_ID, process.env.NOTION_SPRINTS_DB_NAME || 'Sprints')
  const hubPage = await discoverPage(notion, process.env.NOTION_HUB_PAGE_ID, process.env.NOTION_HUB_PAGE_NAME || 'LUDUS Platform')
  if (!tasksDb || !sprintsDb || !hubPage) throw new Error('Failed to discover Tasks DB, Sprints DB, or LUDUS Platform hub page')
  // Optional anchor: resolve database from a task page URL or page id
  if (args.anchor) {
    const anchorId = extractIdFromUrlOrId(args.anchor)
    if (anchorId) {
      try {
        const page = await notion.getPage(anchorId)
        const parent = page.parent || {}
        if (parent.type === 'database_id' && parent.database_id) tasksDb = { id: parent.database_id }
      } catch (e) {
        console.warn('Anchor resolution failed:', e.message)
      }
    }
  }

  // Resolve LUDUS project page id (relation target)
  const projectPage = await notion.searchPageByTitle(projectName)
  if (!projectPage) throw new Error(`Project page not found: ${projectName}`)

  // Discover schema for Tasks DB (best-effort)
  let schema = null
  try {
    const tasksDbJson = await notion.getDatabase(tasksDb.id)
    schema = notion.deriveTasksSchema(tasksDbJson)
  } catch (e) {
    console.warn('Schema discovery failed, proceeding without schema:', e.message)
  }

  // Fetch tasks with optional sprint and priority filters
  let taskPages = await notion.queryLudusTasks(
    tasksDb.id,
    projectPage?.id,
    args['all-status'] ? [] : ['Todo', 'In Progress', 'In Review', 'Blocked'],
    { disableProjectFilter: !!args['no-project-filter'], schema }
  )

  // Optional filter by sprint number
  if (args.sprint) {
    const sprintName = String(args.sprint).trim() === '1' ? 'Sprint 1' : 'Sprint 2'
    const sprintPage = await notion.findSprintByName(sprintsDb.id, sprintName)
    const sprintId = sprintPage?.id
    if (sprintId && schema.sprintName) {
      taskPages = taskPages.filter(p => (p.properties?.[schema.sprintName]?.relation || []).some(r => r.id === sprintId))
    }
  }

  // Optional filter by priority list (comma-separated, e.g., P0,P1)
  if (args.priority) {
    const allow = String(args.priority).split(',').map(s => s.trim().toUpperCase())
    taskPages = taskPages.filter(p => {
      const pr = schema?.priorityName ? (p.properties?.[schema.priorityName]?.select?.name) :
        // fallback: find any select named like priority
        (Object.entries(p.properties || {}).find(([k, v]) => v?.type === 'select' && /priority/i.test(k))?.[1]?.select?.name)
      return pr && allow.includes(pr.toUpperCase())
    })
  }

  // Sprint windows
  const windows = await notion.getSprintWindows(sprintsDb.id)
  const sprint1 = windows['Sprint 1'] || null
  const sprint2 = windows['Sprint 2'] || null

  const rows = []
  let linked = 0
  let created = 0
  let flagged = 0

  for (const page of taskPages) {
    const title = notion.getTitleFromTaskPage(page)
    const priority = schema.priorityName ? (page.properties?.[schema.priorityName]?.select?.name || null) : null
    const due = schema.dueName ? (page.properties?.[schema.dueName]?.date?.start || null) : null
    const sprintIds = schema.sprintName ? ((page.properties?.[schema.sprintName]?.relation || []).map(r => r.id)) : []
    const key = extractKeyFromTitle(title)
    const searchTitle = title.replace(/^([A-Z]+-\d+):\s*/, '')
    let linearIssue = null
    let action = ''
    let notes = ''

    try {
      if (key) {
        linearIssue = await linear.getIssueByKey(key)
      }
      if (!linearIssue) {
        const found = await linear.searchIssueByTitle(searchTitle)
        const chosen = chooseLinearMatchByTitle(found, searchTitle)
        if (chosen && chosen.title.toLowerCase() === title.toLowerCase()) {
          linearIssue = chosen
        }
      }
      if (!linearIssue) {
        if (args['no-create']) {
          notes = 'No Linear issue found; creation disabled'
          flagged++
        } else {
          const teamKeyForTask = key ? key.split('-')[0] : linearDefaultTeam
          linearIssue = await linear.createIssue({ title, description: '', priority, labels: ['LUDUS'], teamKey: teamKeyForTask })
          action = 'created'
          created++
        }
      } else {
        action = 'linked'
        linked++
      }

      if (linearIssue?.url) {
        await notion.updateTaskExternalUrl(page.id, linearIssue.url, { dryRun })
      }

      // Sprint/Due enforcement
      let targetSprintId = null
      let adjustedDue = null
      if (due && sprint1 && withinWindow(due, sprint1.start, sprint1.end)) {
        targetSprintId = await ensureSprintInRelations(notion, sprintIds, 'Sprint 1', sprintsDb.id)
      } else if (due && sprint2 && withinWindow(due, sprint2.start, sprint2.end)) {
        targetSprintId = await ensureSprintInRelations(notion, sprintIds, 'Sprint 2', sprintsDb.id)
      } else if (due && sprint1 && !withinWindow(due, sprint1.start, sprint1.end) && sprint2 && !withinWindow(due, sprint2.start, sprint2.end)) {
        notes = addNote(notes, 'Due out of sprint windows')
        flagged++
      }
      if (adjustedDue || targetSprintId) {
        await notion.updateTaskDueAndSprint(page.id, { dueISO: adjustedDue, sprintPageId: targetSprintId }, { dryRun })
      }

      rows.push([title, sprintLabelFromIds(sprintIds), due || '', priority || '', linearIssue?.url || '', action || '', notes || ''])
    } catch (err) {
      if (/ratelimit/i.test(err.message)) {
        // simple backoff
        await new Promise(r => setTimeout(r, 1500))
      }
      rows.push([title, sprintLabelFromIds(sprintIds), due || '', priority || '', '', action || '', `Error: ${err.message}`])
      flagged++
    }
  }

  const summary = { total: taskPages.length, linked, created, flagged }
  await publishReport(notion, hubPage.id, rows, summary, { dryRun })

  writeArtifacts(rows, summary)

  console.log('Done', summary)
}

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token.startsWith('--')) {
      const sliced = token.replace(/^--/, '')
      if (sliced.includes('=')) {
        const [k, v] = sliced.split('=')
        args[k] = v === undefined ? true : v
      } else {
        const k = sliced
        const next = argv[i + 1]
        if (next && !next.startsWith('--')) {
          args[k] = next
          i++
        } else {
          args[k] = true
        }
      }
    }
  }
  return args
}

function extractIdFromUrlOrId(input) {
  if (!input) return null
  try {
    const url = new URL(input)
    // Notion URL slug ends with ...<pageId>
    const last = url.pathname.split('/').filter(Boolean).pop() || ''
    const m = last.match(/([a-f0-9]{32})/i)
    if (m) return m[1]
  } catch (_) {
    // not a URL, maybe raw id
    const m = String(input).match(/([a-f0-9]{32})/i)
    if (m) return m[1]
  }
  return null
}

async function discoverDb(notion, id, name) {
  if (id) return { id }
  const db = await notion.searchDatabaseByName(name)
  return db
}

async function discoverPage(notion, id, name) {
  if (id) return { id }
  const page = await notion.searchPageByTitle(name)
  return page
}

async function ensureSprintInRelations(notion, currentIds, sprintName, sprintsDbId) {
  if (currentIds && currentIds.length > 0) return null
  const page = await notion.findSprintByName(sprintsDbId, sprintName)
  return page ? page.id : null
}

function sprintLabelFromIds(ids) {
  if (!ids || ids.length === 0) return ''
  return 'Linked'
}

async function publishReport(notion, hubPageId, rows, summary, { dryRun }) {
  const title = 'Linear Linking — Status'
  const page = await notion.ensureSubpageUnder(hubPageId, title)
  const csvLines = [
    'Task,Sprint,Due,Priority,External Issue URL,Action taken,Notes',
    ...rows.map(r => r.map(s => escapeCsv(String(s || ''))).join(','))
  ].join('\n')
  const header = `Total scanned: ${summary.total} | Linked: ${summary.linked} | Created: ${summary.created} | Flagged: ${summary.flagged}`
  const blocks = [
    { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: header } }] } },
    { object: 'block', type: 'code', code: { language: 'plain text', rich_text: [{ type: 'text', text: { content: csvLines } }] } }
  ]
  if (!dryRun) {
    await notion.replacePageContent(page.id, blocks)
  }
}

function escapeCsv(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

function writeArtifacts(rows, summary) {
  const dir = path.join(process.cwd(), 'logs')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  fs.writeFileSync(path.join(dir, `linking-summary-${ts}.json`), JSON.stringify(summary, null, 2))
  const csv = ['Task,Sprint,Due,Priority,External Issue URL,Action taken,Notes', ...rows.map(r => r.map(s => escapeCsv(String(s || ''))).join(','))].join('\n')
  fs.writeFileSync(path.join(dir, `linking-report-${ts}.csv`), csv)
}

if (require.main === module) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}


