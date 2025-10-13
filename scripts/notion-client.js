// use global fetch to avoid adding dependencies

class NotionHelper {
  constructor(options = {}) {
    const token = options.token || process.env.NOTION_TOKEN
    if (!token) throw new Error('NOTION_TOKEN is required')
    this.baseUrl = 'https://api.notion.com/v1'
    this.headers = {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  }

  _normalizeId(id) {
    if (!id) return id
    if (id.includes('-')) return id
    const m = id.match(/^([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})$/i)
    if (!m) return id
    return `${m[1]}-${m[2]}-${m[3]}-${m[4]}-${m[5]}`
  }

  async getPage(pageId) {
    const res = await fetch(`${this.baseUrl}/pages/${this._normalizeId(pageId)}`, {
      method: 'GET',
      headers: this.headers
    })
    if (!res.ok) throw new Error(`Failed to get page ${pageId}`)
    return await res.json()
  }

  async getDatabase(databaseId) {
    const res = await fetch(`${this.baseUrl}/databases/${this._normalizeId(databaseId)}`, {
      method: 'GET',
      headers: this.headers
    })
    if (!res.ok) throw new Error(`Failed to get database ${databaseId}`)
    return await res.json()
  }

  deriveTasksSchema(dbJson) {
    const props = dbJson.properties || {}
    const names = Object.keys(props)
    const findBy = (predicate) => names.find(n => predicate(n, props[n]))
    const titleName = findBy((n, p) => p.type === 'title') || 'Name'
    const statusName = findBy((n, p) => p.type === 'status') || null
    const projectName = findBy((n, p) => p.type === 'relation' && /project/i.test(n)) || findBy((n, p) => p.type === 'relation') || null
    const sprintName = findBy((n, p) => p.type === 'relation' && /sprint/i.test(n)) || null
    const priorityName = findBy((n, p) => p.type === 'select' && /priority/i.test(n)) || findBy((n, p) => p.type === 'select') || null
    const dueName = findBy((n, p) => p.type === 'date' && (/due/i.test(n) || /date/i.test(n))) || findBy((n, p) => p.type === 'date') || null
    const externalUrlName = findBy((n, p) => p.type === 'url' && (/external/i.test(n) || /linear/i.test(n) || /issue/i.test(n))) || findBy((n, p) => p.type === 'url') || null
    return { titleName, statusName, projectName, sprintName, priorityName, dueName, externalUrlName }
  }

  async searchDatabaseByName(name) {
    const res = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
      query: name,
      filter: { value: 'database', property: 'object' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' }
      })
    })
    const data = await res.json()
    const results = data.results || []
    const exact = results.find(r => r.object === 'database' && this._getTitle(r.title) === name)
    return exact || results.find(r => r.object === 'database') || null
  }

  async searchPageByTitle(title) {
    const res = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
      query: title,
      filter: { value: 'page', property: 'object' },
      sort: { direction: 'descending', timestamp: 'last_edited_time' }
      })
    })
    const data = await res.json()
    const results = data.results || []
    const exact = results.find(r => r.object === 'page' && this._getTitle(r.properties?.title || r.properties?.Name) === title)
    if (exact) return exact
    return results.find(r => r.object === 'page') || null
  }

  _getTitle(titleProp) {
    if (!titleProp) return ''
    if (Array.isArray(titleProp)) {
      const first = titleProp[0]
      return first && (first.plain_text || first.text?.content) ? (first.plain_text || first.text?.content) : ''
    }
    if (titleProp?.title) {
      return (titleProp.title[0] && (titleProp.title[0].plain_text || titleProp.title[0].text?.content)) || ''
    }
    return ''
  }

  async queryLudusTasks(tasksDbId, projectPageId, statusNames = ['Todo', 'In Progress', 'In Review', 'Blocked'], { disableProjectFilter = false, schema } = {}) {
    const andFilters = []
    if (!disableProjectFilter && projectPageId && schema?.projectName) {
      andFilters.push({ property: schema.projectName, relation: { contains: projectPageId } })
    }
    if (Array.isArray(statusNames) && statusNames.length > 0 && schema?.statusName) {
      andFilters.push({ or: statusNames.map(name => ({ property: schema.statusName, status: { equals: name } })) })
    }
    const filter = andFilters.length ? { and: andFilters } : undefined
    const pageSize = 100
    let cursor = undefined
    const pages = []
    do {
      const payload = { start_cursor: cursor, page_size: pageSize }
      if (filter) payload.filter = filter
      const res = await fetch(`${this.baseUrl}/databases/${this._normalizeId(tasksDbId)}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      pages.push(...(data.results || []))
      cursor = data.has_more ? data.next_cursor : undefined
    } while (cursor)
    return pages
  }

  async getSprintWindows(sprintsDbId) {
    const sprints = {}
    for (const sprintName of ['Sprint 1', 'Sprint 2']) {
      const res = await fetch(`${this.baseUrl}/databases/${this._normalizeId(sprintsDbId)}/query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ filter: { property: 'Name', title: { equals: sprintName } }, page_size: 1 })
      })
      const data = await res.json()
      const page = (data.results || [])[0]
      if (!page) continue
      const window = this._extractFirstDateRange(page.properties)
      if (window) sprints[sprintName] = window
    }
    return sprints
  }

  _extractFirstDateRange(properties) {
    for (const key of Object.keys(properties || {})) {
      const prop = properties[key]
      if (prop?.type === 'date' && prop.date) {
        const { start, end } = prop.date
        if (start) return { start, end: end || start }
      }
    }
    return null
  }

  getTitleFromTaskPage(page) {
    const props = page.properties || {}
    if (props.Task?.type === 'title') return this._getTitle(props.Task)
    for (const key of Object.keys(props)) {
      if (props[key]?.type === 'title') return this._getTitle(props[key])
    }
    return ''
  }

  getPriorityFromTaskPage(page) {
    const prop = page.properties?.Priority
    if (prop?.type === 'select' && prop.select) return prop.select.name || null
    return null
  }

  getDueFromTaskPage(page) {
    const prop = page.properties?.Due
    if (prop?.type === 'date' && prop.date?.start) return prop.date.start
    return null
  }

  getSprintRelationIdsFromTaskPage(page) {
    const prop = page.properties?.Sprint
    if (prop?.type === 'relation' && Array.isArray(prop.relation)) return prop.relation.map(r => r.id)
    return []
  }

  async updateTaskExternalUrl(pageId, url, { dryRun = false } = {}) {
    if (dryRun) return
    await fetch(`${this.baseUrl}/pages/${pageId}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ properties: { 'External Issue URL': { url } } })
    })
  }

  async updateTaskDueAndSprint(pageId, { dueISO, sprintPageId }, { dryRun = false } = {}) {
    if (dryRun) return
    const properties = {}
    if (dueISO) properties['Due'] = { date: { start: dueISO } }
    if (sprintPageId) properties['Sprint'] = { relation: [{ id: sprintPageId }] }
    if (Object.keys(properties).length === 0) return
    await fetch(`${this.baseUrl}/pages/${pageId}`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ properties })
    })
  }

  async ensureSubpageUnder(parentPageId, title) {
    const found = await this._findChildPageByTitle(parentPageId, title)
    if (found) return found
    const res = await fetch(`${this.baseUrl}/pages`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ parent: { type: 'page_id', page_id: parentPageId }, properties: { title: { title: [{ type: 'text', text: { content: title } }] } } })
    })
    return await res.json()
  }

  async _findChildPageByTitle(parentPageId, title) {
    const res = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query: title, filter: { value: 'page', property: 'object' } })
    })
    const data = await res.json()
    const results = data.results || []
    const page = results.find(r => r.parent?.type === 'page_id' && r.parent.page_id === parentPageId && this._getTitle(r.properties?.title || r.properties?.Name) === title)
    return page || null
  }

  async findSprintByName(sprintsDbId, sprintName) {
    const res = await fetch(`${this.baseUrl}/databases/${this._normalizeId(sprintsDbId)}/query`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ filter: { property: 'Name', title: { equals: sprintName } }, page_size: 1 })
    })
    const data = await res.json()
    const page = (data.results || [])[0]
    return page || null
  }

  async replacePageContent(pageId, blocks) {
    await fetch(`${this.baseUrl}/blocks/${pageId}/children`, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify({ children: blocks })
    })
  }
}

module.exports = { NotionHelper }


