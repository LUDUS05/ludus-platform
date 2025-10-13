class LinearHelper {
  constructor(options = {}) {
    const token = options.token || process.env.LINEAR_TOKEN || process.env.LINEAR_API_KEY
    if (!token) throw new Error('LINEAR_TOKEN is required')
    this.token = token
    this.teamKey = options.teamKey || 'LDS'
    this.teamKeyToId = new Map()
  }

  async _graphql(query, variables) {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { 
        'Authorization': this.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    })
    const data = await res.json()
    if (data.errors) {
      const msg = data.errors.map(e => e.message).join('; ')
      throw new Error(`Linear GraphQL error: ${msg}`)
    }
    return data.data
  }

  async getIssueByKey(key) {
    // Fallback to search via identifier string
    const query = `query SearchByIdentifier($q: String!) { issues(filter: { query: $q }, first: 5) { nodes { id identifier title url priority } } }`
    const data = await this._graphql(query, { q: key })
    const nodes = data.issues?.nodes || []
    const exact = nodes.find(n => n.identifier === key)
    return exact || nodes[0] || null
  }

  async searchIssueByTitle(title) {
    const query = `query SearchIssues($query: String!) { issues(filter: { query: $query }, first: 10) { nodes { id title url identifier priority } } }`
    const data = await this._graphql(query, { query: title })
    const nodes = data.issues?.nodes || []
    return nodes
  }

  async createIssue({ title, description, priority, labels = [], teamKey }) {
    const pk = this._mapPriority(priority)
    const mutation = `mutation CreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { id title url identifier priority } } }`
    const teamId = await this.getTeamIdByKey(teamKey || this.teamKey)
    const input = { title, description, teamId, priority: pk, labelNames: labels }
    const data = await this._graphql(mutation, { input })
    return data.issueCreate?.issue || null
  }

  async getTeamIdByKey(key) {
    if (!key) return null
    if (this.teamKeyToId.has(key)) return this.teamKeyToId.get(key)
    const query = `query Teams { teams(first: 50) { nodes { id key name } } }`
    const data = await this._graphql(query, {})
    const nodes = data.teams?.nodes || []
    for (const t of nodes) this.teamKeyToId.set(t.key, t.id)
    return this.teamKeyToId.get(key) || null
  }

  _mapPriority(notioPriority) {
    switch ((notioPriority || '').toUpperCase()) {
      case 'P0':
        return 4 // Highest
      case 'P1':
        return 3 // High
      case 'P2':
        return 2 // Medium
      case 'P3':
        return 1 // Low
      default:
        return 0 // No priority
    }
  }
}

module.exports = { LinearHelper }


