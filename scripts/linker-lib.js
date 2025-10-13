function extractKeyFromTitle(title) {
  if (!title) return null
  const m = title.match(/^([A-Z]+-\d+):/)
  return m ? m[1] : null
}

function chooseLinearMatchByTitle(nodes, title) {
  if (!nodes || nodes.length === 0) return null
  const exact = nodes.find(n => n.title.trim().toLowerCase() === title.trim().toLowerCase())
  if (exact) return exact
  return nodes[0]
}

function withinWindow(dateISO, startISO, endISO) {
  if (!dateISO || !startISO || !endISO) return false
  const d = new Date(dateISO)
  const s = new Date(startISO)
  const e = new Date(endISO)
  return d >= s && d <= e
}

module.exports = {
  extractKeyFromTitle,
  chooseLinearMatchByTitle,
  withinWindow
}


