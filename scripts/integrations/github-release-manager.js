/**
 * GitHub Release Manager
 * Tracks releases, deployments, and generates release notes
 */

const { GitHubHelper } = require('../lib/github-helper');
const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');

class GitHubReleaseManager {
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
   * Get all releases
   */
  async getReleases() {
    console.log('\n📦 Fetching releases...');
    
    const releases = await this.github.getReleases();
    
    const processed = releases.map(release => ({
      id: release.id,
      tagName: release.tag_name,
      name: release.name,
      draft: release.draft,
      prerelease: release.prerelease,
      createdAt: release.created_at,
      publishedAt: release.published_at,
      author: release.author.login,
      body: release.body,
      url: release.html_url,
      assets: release.assets.map(asset => ({
        name: asset.name,
        size: asset.size,
        downloadUrl: asset.browser_download_url,
        downloads: asset.download_count
      }))
    }));

    console.log(`   Found ${processed.length} releases`);
    processed.slice(0, 5).forEach(release => {
      console.log(`   📦 ${release.tagName}: ${release.name || 'No name'}`);
    });

    return processed;
  }

  /**
   * Get latest release
   */
  async getLatestRelease() {
    console.log('\n🆕 Fetching latest release...');
    
    try {
      const release = await this.github.getLatestRelease();
      
      console.log(`   Latest: ${release.tag_name} - ${release.name}`);
      console.log(`   Published: ${new Date(release.published_at).toLocaleDateString()}`);
      
      return {
        tagName: release.tag_name,
        name: release.name,
        body: release.body,
        publishedAt: release.published_at,
        url: release.html_url
      };
    } catch (error) {
      console.log('   ℹ️  No releases found');
      return null;
    }
  }

  /**
   * Generate release notes from commits
   */
  async generateReleaseNotes(since, until = null) {
    console.log('\n📝 Generating release notes...');
    
    const commits = await this.github.getCommits(since);
    
    const notes = {
      features: [],
      fixes: [],
      improvements: [],
      other: []
    };

    commits.forEach(commit => {
      const message = commit.commit.message;
      const firstLine = message.split('\n')[0];
      
      const entry = {
        message: firstLine,
        sha: commit.sha.substring(0, 7),
        author: commit.commit.author.name,
        date: commit.commit.author.date
      };

      if (message.toLowerCase().includes('feat:') || message.toLowerCase().includes('feature:')) {
        notes.features.push(entry);
      } else if (message.toLowerCase().includes('fix:') || message.toLowerCase().includes('bug:')) {
        notes.fixes.push(entry);
      } else if (message.toLowerCase().includes('improve:') || message.toLowerCase().includes('enhancement:')) {
        notes.improvements.push(entry);
      } else {
        notes.other.push(entry);
      }
    });

    console.log(`   ✨ Features: ${notes.features.length}`);
    console.log(`   🐛 Fixes: ${notes.fixes.length}`);
    console.log(`   ⚡ Improvements: ${notes.improvements.length}`);
    console.log(`   📦 Other: ${notes.other.length}`);

    return notes;
  }

  /**
   * Format release notes as markdown
   */
  formatReleaseNotes(notes, version) {
    let markdown = `# Release ${version}\n\n`;
    markdown += `Released on ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}\n\n`;

    if (notes.features.length > 0) {
      markdown += `## ✨ Features\n\n`;
      notes.features.forEach(entry => {
        markdown += `- ${entry.message} (${entry.sha})\n`;
      });
      markdown += '\n';
    }

    if (notes.fixes.length > 0) {
      markdown += `## 🐛 Bug Fixes\n\n`;
      notes.fixes.forEach(entry => {
        markdown += `- ${entry.message} (${entry.sha})\n`;
      });
      markdown += '\n';
    }

    if (notes.improvements.length > 0) {
      markdown += `## ⚡ Improvements\n\n`;
      notes.improvements.forEach(entry => {
        markdown += `- ${entry.message} (${entry.sha})\n`;
      });
      markdown += '\n';
    }

    if (notes.other.length > 0) {
      markdown += `## 📦 Other Changes\n\n`;
      notes.other.forEach(entry => {
        markdown += `- ${entry.message} (${entry.sha})\n`;
      });
      markdown += '\n';
    }

    return markdown;
  }

  /**
   * Track deployment status
   */
  async trackDeployments() {
    console.log('\n🚀 Tracking deployments...');
    
    // This would typically integrate with your CI/CD system
    // For now, we'll use releases as deployment markers
    const releases = await this.getReleases();
    
    const deployments = releases
      .filter(r => !r.draft && !r.prerelease)
      .map(r => ({
        version: r.tagName,
        environment: r.prerelease ? 'staging' : 'production',
        deployedAt: r.publishedAt,
        deployedBy: r.author,
        url: r.url
      }));

    console.log(`   Found ${deployments.length} production deployments`);
    
    return deployments;
  }

  /**
   * Generate complete release report
   */
  async generateReport() {
    console.log('\n📊 GitHub Release Management Report');
    console.log('===================================\n');

    const [releases, latest, deployments] = await Promise.all([
      this.getReleases(),
      this.getLatestRelease(),
      this.trackDeployments()
    ]);

    let releaseNotes = null;
    if (latest && latest.publishedAt) {
      releaseNotes = await this.generateReleaseNotes(latest.publishedAt);
    }

    return {
      releases: releases.slice(0, 10), // Last 10 releases
      latestRelease: latest,
      releaseNotes,
      deployments: deployments.slice(0, 10), // Last 10 deployments
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = { GitHubReleaseManager };

// CLI Usage
if (require.main === module) {
  const fs = require('fs');
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const manager = new GitHubReleaseManager({
    githubToken: getEnv('GITHUB_TOKEN'),
    githubOwner: getEnv('GITHUB_OWNER') || 'your-org',
    githubRepo: getEnv('GITHUB_REPO') || 'ludus-platform',
    notionToken: getEnv('NOTION_TOKEN')
  });

  manager.generateReport()
    .then(report => {
      console.log('\n✅ Release report generated successfully');
      fs.writeFileSync(
        'github-release-report.json',
        JSON.stringify(report, null, 2)
      );
      console.log('   Saved to: github-release-report.json');
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

