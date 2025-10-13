/**
 * GitHub Code Review Dashboard
 * Tracks code review status and generates metrics
 */

const { GitHubHelper } = require('../lib/github-helper');
const { NotionHelperExtended } = require('../lib/notion-helper-extended');
const { ConfigManager } = require('../lib/config-manager');

class GitHubReviewDashboard {
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
   * Get all PRs with review status
   */
  async getPRsWithReviews() {
    console.log('\n🔍 Fetching PRs with review status...');
    
    const prs = await this.github.getPullRequests('open');
    const prsWithReviews = [];

    for (const pr of prs) {
      try {
        const details = await this.github.getPullRequestDetails(pr.number);
        
        const reviewStatus = this.calculateReviewStatus(details.reviews);
        
        prsWithReviews.push({
          number: pr.number,
          title: pr.title,
          author: pr.user.login,
          url: pr.html_url,
          createdAt: pr.created_at,
          reviewStatus: reviewStatus.status,
          reviewCount: details.reviews.length,
          approvals: reviewStatus.approvals,
          changesRequested: reviewStatus.changesRequested,
          commentsCount: reviewStatus.comments,
          reviewers: reviewStatus.reviewers
        });

        console.log(`   ✓ #${pr.number}: ${reviewStatus.status} (${reviewStatus.approvals} approvals)`);
      } catch (error) {
        console.log(`   ⚠️  Could not fetch details for PR #${pr.number}: ${error.message}`);
      }
    }

    return prsWithReviews;
  }

  /**
   * Calculate review status from reviews array
   */
  calculateReviewStatus(reviews) {
    const latestReviews = new Map();
    
    // Get latest review from each reviewer
    reviews.forEach(review => {
      const reviewer = review.user.login;
      const existing = latestReviews.get(reviewer);
      
      if (!existing || new Date(review.submitted_at) > new Date(existing.submitted_at)) {
        latestReviews.set(reviewer, review);
      }
    });

    let approvals = 0;
    let changesRequested = 0;
    let comments = 0;
    const reviewers = [];

    latestReviews.forEach(review => {
      reviewers.push(review.user.login);
      
      switch (review.state) {
        case 'APPROVED':
          approvals++;
          break;
        case 'CHANGES_REQUESTED':
          changesRequested++;
          break;
        case 'COMMENTED':
          comments++;
          break;
      }
    });

    let status = 'Pending Review';
    if (changesRequested > 0) {
      status = 'Changes Requested';
    } else if (approvals >= 2) {
      status = 'Approved';
    } else if (approvals === 1) {
      status = 'Partially Approved';
    } else if (comments > 0) {
      status = 'Under Discussion';
    }

    return {
      status,
      approvals,
      changesRequested,
      comments,
      reviewers
    };
  }

  /**
   * Generate review metrics
   */
  async generateReviewMetrics() {
    console.log('\n📊 Generating review metrics...');
    
    const prs = await this.getPRsWithReviews();
    
    const metrics = {
      totalOpenPRs: prs.length,
      needsReview: prs.filter(pr => pr.reviewStatus === 'Pending Review').length,
      approved: prs.filter(pr => pr.reviewStatus === 'Approved').length,
      changesRequested: prs.filter(pr => pr.reviewStatus === 'Changes Requested').length,
      underDiscussion: prs.filter(pr => pr.reviewStatus === 'Under Discussion').length,
      averageReviewTime: 0, // TODO: Calculate from PR history
      reviewerActivity: this.calculateReviewerActivity(prs)
    };

    console.log('\n   Review Metrics:');
    console.log(`   📝 Total Open PRs: ${metrics.totalOpenPRs}`);
    console.log(`   ⏳ Needs Review: ${metrics.needsReview}`);
    console.log(`   ✅ Approved: ${metrics.approved}`);
    console.log(`   🔄 Changes Requested: ${metrics.changesRequested}`);
    console.log(`   💬 Under Discussion: ${metrics.underDiscussion}`);

    return metrics;
  }

  /**
   * Calculate reviewer activity
   */
  calculateReviewerActivity(prs) {
    const activity = new Map();
    
    prs.forEach(pr => {
      pr.reviewers.forEach(reviewer => {
        const count = activity.get(reviewer) || 0;
        activity.set(reviewer, count + 1);
      });
    });

    const sorted = Array.from(activity.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([reviewer, count]) => ({ reviewer, count }));

    console.log('\n   👥 Reviewer Activity:');
    sorted.forEach(({ reviewer, count }) => {
      console.log(`      ${reviewer}: ${count} reviews`);
    });

    return sorted;
  }

  /**
   * Generate complete dashboard
   */
  async generateDashboard() {
    console.log('\n📊 GitHub Code Review Dashboard');
    console.log('================================\n');

    const [prs, metrics] = await Promise.all([
      this.getPRsWithReviews(),
      this.generateReviewMetrics()
    ]);

    return {
      pullRequests: prs,
      metrics,
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = { GitHubReviewDashboard };

// CLI Usage
if (require.main === module) {
  const fs = require('fs');
  const envContent = fs.readFileSync('development.env', 'utf8');
  const getEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1] : process.env[key];
  };

  const dashboard = new GitHubReviewDashboard({
    githubToken: getEnv('GITHUB_TOKEN'),
    githubOwner: getEnv('GITHUB_OWNER') || 'your-org',
    githubRepo: getEnv('GITHUB_REPO') || 'ludus-platform',
    notionToken: getEnv('NOTION_TOKEN')
  });

  dashboard.generateDashboard()
    .then(data => {
      console.log('\n✅ Dashboard generated successfully');
      fs.writeFileSync(
        'github-review-dashboard.json',
        JSON.stringify(data, null, 2)
      );
      console.log('   Saved to: github-review-dashboard.json');
    })
    .catch(error => {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    });
}

