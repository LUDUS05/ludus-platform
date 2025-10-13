/**
 * GitHub API Helper for LUDUS Platform
 * Handles interactions with GitHub API for repository tracking, PRs, releases
 */

class GitHubHelper {
  constructor({ token, owner, repo }) {
    this.token = token;
    this.owner = owner;
    this.repo = repo;
    this.baseUrl = 'https://api.github.com';
  }

  /**
   * Make authenticated GitHub API request
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get repository information
   */
  async getRepository() {
    return this._request(`/repos/${this.owner}/${this.repo}`);
  }

  /**
   * Get recent commits
   */
  async getCommits(since = null, limit = 100) {
    const params = new URLSearchParams({ per_page: limit });
    if (since) params.append('since', since);
    
    return this._request(`/repos/${this.owner}/${this.repo}/commits?${params}`);
  }

  /**
   * Get pull requests
   */
  async getPullRequests(state = 'all', limit = 100) {
    const params = new URLSearchParams({ state, per_page: limit });
    return this._request(`/repos/${this.owner}/${this.repo}/pulls?${params}`);
  }

  /**
   * Get PR details including reviews
   */
  async getPullRequestDetails(prNumber) {
    const pr = await this._request(`/repos/${this.owner}/${this.repo}/pulls/${prNumber}`);
    const reviews = await this._request(`/repos/${this.owner}/${this.repo}/pulls/${prNumber}/reviews`);
    const commits = await this._request(`/repos/${this.owner}/${this.repo}/pulls/${prNumber}/commits`);
    
    return { ...pr, reviews, commits };
  }

  /**
   * Get releases
   */
  async getReleases(limit = 50) {
    const params = new URLSearchParams({ per_page: limit });
    return this._request(`/repos/${this.owner}/${this.repo}/releases?${params}`);
  }

  /**
   * Get latest release
   */
  async getLatestRelease() {
    return this._request(`/repos/${this.owner}/${this.repo}/releases/latest`);
  }

  /**
   * Get issues
   */
  async getIssues(state = 'all', limit = 100) {
    const params = new URLSearchParams({ state, per_page: limit });
    return this._request(`/repos/${this.owner}/${this.repo}/issues?${params}`);
  }

  /**
   * Get repository statistics
   */
  async getStats() {
    const [repo, contributors, commits] = await Promise.all([
      this.getRepository(),
      this._request(`/repos/${this.owner}/${this.repo}/contributors`),
      this.getCommits(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), 100)
    ]);

    return {
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      contributors: contributors.length,
      commitsLast30Days: commits.length,
      lastPush: repo.pushed_at
    };
  }

  /**
   * Extract Linear issue IDs from commit messages
   */
  extractLinearIssues(commitMessage) {
    const regex = /([A-Z]{2,}-\d+)/g;
    return commitMessage.match(regex) || [];
  }

  /**
   * Extract task references from commit messages
   */
  extractTaskReferences(commitMessage) {
    // Matches patterns like: #123, task-123, TASK-123
    const regex = /#(\d+)|task[- ](\d+)/gi;
    const matches = [];
    let match;
    
    while ((match = regex.exec(commitMessage)) !== null) {
      matches.push(match[1] || match[2]);
    }
    
    return matches;
  }
}

module.exports = { GitHubHelper };

