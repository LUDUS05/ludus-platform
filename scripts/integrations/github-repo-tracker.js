/**
 * GitHub Repository Tracker
 * Tracks repository activity and links to Notion tasks
 */

const { GitHubHelper } = require('../lib/github-helper');
const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');

class GitHubRepoTracker {
  constructor({ githubToken, githubOwner, githubRepo, notionToken }) {
    this.github = new GitHubHelper({ 
      token: githubToken, 
      owner: githubOwner, 
      repo: githubRepo 
    });
    this.notion = new NotionHelperExtended({ token: notionToken });
    this.config = new ConfigManager();
  }

  /**
   * Track recent commits and link to tasks
   */
  async trackCommits(since = null) {
    console.log('\n📊 Tracking GitHub commits...');
    
    const commits = await this.github.getCommits(since);
    const tasksDbId = this.config.getDatabaseId('tasks');
    const tracked = [];

    for (const commit of commits) {
      const message = commit.commit.message;
      const linearIssues = this.github.extractLinearIssues(message);
      const taskRefs = this.github.extractTaskReferences(message);

      console.log(`   📝 ${commit.sha.substring(0, 7)}: ${message.split('\n')[0]}`);
      
      if (linearIssues.length > 0 || taskRefs.length > 0) {
        tracked.push({
          sha: commit.sha,
          message: message,
          author: commit.commit.author.name,
          date: commit.commit.author.date,
          url: commit.html_url,
          linearIssues,
          taskRefs
        });
        
        console.log(`      🔗 Linked to: ${linearIssues.join(', ')} ${taskRefs.join(', ')}`);
      }
    }

    console.log(`\n✅ Tracked ${tracked.length} commits with task references`);
    return tracked;
  }

  /**
   * Track pull requests
   */
  async trackPullRequests() {
    console.log('\n🔀 Tracking pull requests...');
    
    const prs = await this.github.getPullRequests('open');
    const tracked = [];

    for (const pr of prs) {
      const linearIssues = this.github.extractLinearIssues(pr.title + ' ' + pr.body);
      
      tracked.push({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        author: pr.user.login,
        url: pr.html_url,
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        linearIssues
      });

      console.log(`   🔀 #${pr.number}: ${pr.title}`);
      if (linearIssues.length > 0) {
        console.log(`      🔗 Linked to: ${linearIssues.join(', ')}`);
      }
    }

    console.log(`\n✅ Tracked ${tracked.length} open pull requests`);
    return tracked;
  }

  /**
   * Get repository statistics
   */
  async getRepositoryStats() {
    console.log('\n📈 Fetching repository statistics...');
    
    const stats = await this.github.getStats();
    
    console.log('   Repository Stats:');
    console.log(`   ⭐ Stars: ${stats.stars}`);
    console.log(`   🍴 Forks: ${stats.forks}`);
    console.log(`   🐛 Open Issues: ${stats.openIssues}`);
    console.log(`   👥 Contributors: ${stats.contributors}`);
    console.log(`   📝 Commits (30d): ${stats.commitsLast30Days}`);
    console.log(`   🕐 Last Push: ${new Date(stats.lastPush).toLocaleString()}`);

    return stats;
  }

  /**
   * Generate tracking report
   */
  async generateReport() {
    console.log('\n📊 Generating GitHub Activity Report');
    console.log('=====================================\n');

    const [stats, commits, prs] = await Promise.all([
      this.getRepositoryStats(),
      this.trackCommits(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      this.trackPullRequests()
    ]);

    return {
      stats,
      commits,
      pullRequests: prs,
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = { GitHubRepoTracker };

// CLI Usage
if (require.main === module) {
  const fs = require('fs');
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const tracker = new GitHubRepoTracker({
    githubToken: getEnv('GITHUB_TOKEN'),
    githubOwner: getEnv('GITHUB_OWNER') || 'your-org',
    githubRepo: getEnv('GITHUB_REPO') || 'ludus-platform',
    notionToken: getEnv('NOTION_TOKEN')
  });

  tracker.generateReport()
    .then(report => {
      console.log('\n✅ Report generated successfully');
      fs.writeFileSync(
        'github-activity-report.json',
        JSON.stringify(report, null, 2)
      );
      console.log('   Saved to: github-activity-report.json');
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

