#!/usr/bin/env node

/**
 * Extended Linear Helper
 * Provides advanced functionality for Linear integration
 */

const { LinearHelper } = require('../linear-client');

class LinearHelperExtended extends LinearHelper {
  constructor(options = {}) {
    super(options);
  }

  /**
   * Get all projects for a team
   */
  async getProjects(teamKey = null) {
    const key = teamKey || this.teamKey;
    const teamId = await this.getTeamIdByKey(key);
    
    const query = `
      query GetProjects($teamId: String!) {
        team(id: $teamId) {
          projects(first: 100) {
            nodes {
              id
              name
              description
              state
              priority
              progress
              startDate
              targetDate
              lead {
                id
                name
                email
              }
              members {
                nodes {
                  id
                  name
                  email
                }
              }
              url
              createdAt
              updatedAt
            }
          }
        }
      }
    `;
    
    const data = await this._graphql(query, { teamId });
    return data.team?.projects?.nodes || [];
  }

  /**
   * Get project by ID
   */
  async getProject(projectId) {
    const query = `
      query GetProject($id: String!) {
        project(id: $id) {
          id
          name
          description
          state
          priority
          progress
          startDate
          targetDate
          lead {
            id
            name
            email
          }
          members {
            nodes {
              id
              name
              email
            }
          }
          issues {
            nodes {
              id
              identifier
              title
              state {
                name
              }
              priority
              assignee {
                name
              }
            }
          }
          url
          createdAt
          updatedAt
        }
      }
    `;
    
    const data = await this._graphql(query, { id: projectId });
    return data.project || null;
  }

  /**
   * Get all teams
   */
  async getTeams() {
    const query = `
      query GetTeams {
        teams {
          nodes {
            id
            key
            name
            description
            private
            createdAt
          }
        }
      }
    `;
    
    const data = await this._graphql(query);
    return data.teams?.nodes || [];
  }

  /**
   * Get issue with full details
   */
  async getIssueDetails(issueId) {
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          identifier
          title
          description
          priority
          estimate
          state {
            id
            name
            type
          }
          assignee {
            id
            name
            email
          }
          creator {
            id
            name
            email
          }
          project {
            id
            name
          }
          labels {
            nodes {
              id
              name
              color
            }
          }
          comments {
            nodes {
              id
              body
              user {
                name
              }
              createdAt
            }
          }
          url
          createdAt
          updatedAt
          dueDate
        }
      }
    `;
    
    const data = await this._graphql(query, { id: issueId });
    return data.issue || null;
  }

  /**
   * Update issue
   */
  async updateIssue(issueId, updates) {
    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            identifier
            title
            url
          }
        }
      }
    `;
    
    const data = await this._graphql(mutation, { id: issueId, input: updates });
    return data.issueUpdate?.issue || null;
  }

  /**
   * Get issue history/activity
   */
  async getIssueHistory(issueId) {
    const query = `
      query GetIssueHistory($id: String!) {
        issue(id: $id) {
          history {
            nodes {
              id
              createdAt
              actor {
                name
              }
              fromState {
                name
              }
              toState {
                name
              }
            }
          }
        }
      }
    `;
    
    const data = await this._graphql(query, { id: issueId });
    return data.issue?.history?.nodes || [];
  }

  /**
   * Get user/team members
   */
  async getTeamMembers(teamKey = null) {
    const key = teamKey || this.teamKey;
    const teamId = await this.getTeamIdByKey(key);
    
    const query = `
      query GetTeamMembers($teamId: String!) {
        team(id: $teamId) {
          members {
            nodes {
              id
              name
              email
              active
              createdAt
            }
          }
        }
      }
    `;
    
    const data = await this._graphql(query, { teamId });
    return data.team?.members?.nodes || [];
  }

  /**
   * Get workflow states for a team
   */
  async getWorkflowStates(teamKey = null) {
    const key = teamKey || this.teamKey;
    const teamId = await this.getTeamIdByKey(key);
    
    const query = `
      query GetWorkflowStates($teamId: String!) {
        team(id: $teamId) {
          states {
            nodes {
              id
              name
              type
              color
              position
            }
          }
        }
      }
    `;
    
    const data = await this._graphql(query, { teamId });
    return data.team?.states?.nodes || [];
  }

  /**
   * Get labels for a team
   */
  async getLabels(teamKey = null) {
    const key = teamKey || this.teamKey;
    const teamId = await this.getTeamIdByKey(key);
    
    const query = `
      query GetLabels($teamId: String!) {
        team(id: $teamId) {
          labels {
            nodes {
              id
              name
              color
              description
            }
          }
        }
      }
    `;
    
    const data = await this._graphql(query, { teamId });
    return data.team?.labels?.nodes || [];
  }

  /**
   * Create project
   */
  async createProject({ name, description, teamKey, leadId, targetDate, startDate }) {
    const teamId = await this.getTeamIdByKey(teamKey || this.teamKey);
    
    const mutation = `
      mutation CreateProject($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          success
          project {
            id
            name
            url
          }
        }
      }
    `;
    
    const input = {
      name,
      description,
      teamIds: [teamId]
    };
    
    if (leadId) input.leadId = leadId;
    if (targetDate) input.targetDate = targetDate;
    if (startDate) input.startDate = startDate;
    
    const data = await this._graphql(mutation, { input });
    return data.projectCreate?.project || null;
  }

  /**
   * Update project
   */
  async updateProject(projectId, updates) {
    const mutation = `
      mutation UpdateProject($id: String!, $input: ProjectUpdateInput!) {
        projectUpdate(id: $id, input: $input) {
          success
          project {
            id
            name
            url
          }
        }
      }
    `;
    
    const data = await this._graphql(mutation, { id: projectId, input: updates });
    return data.projectUpdate?.project || null;
  }

  /**
   * Add comment to issue
   */
  async addComment(issueId, body) {
    const mutation = `
      mutation AddComment($input: CommentCreateInput!) {
        commentCreate(input: $input) {
          success
          comment {
            id
            body
            createdAt
          }
        }
      }
    `;
    
    const input = {
      issueId,
      body
    };
    
    const data = await this._graphql(mutation, { input });
    return data.commentCreate?.comment || null;
  }

  /**
   * Get issues for a project
   */
  async getProjectIssues(projectId) {
    const query = `
      query GetProjectIssues($projectId: ID!) {
        project(id: $projectId) {
          issues(first: 100) {
            nodes {
              id
              identifier
              title
              description
              priority
              estimate
              state {
                name
              }
              assignee {
                name
              }
              url
              createdAt
              updatedAt
              dueDate
            }
          }
        }
      }
    `;
    
    const data = await this._graphql(query, { projectId });
    return data.project?.issues?.nodes || [];
  }

  /**
   * Map Linear priority to Notion format
   */
  mapPriorityToNotion(linearPriority) {
    const priorityMap = {
      0: 'P3 - Low',
      1: 'P2 - Medium',
      2: 'P1 - High',
      3: 'Urgent',
      4: 'Urgent'
    };
    return priorityMap[linearPriority] || 'P2 - Medium';
  }

  /**
   * Map Notion priority to Linear format
   */
  mapPriorityToLinear(notionPriority) {
    const priorityMap = {
      'P3 - Low': 0,
      'Low': 0,
      'P2 - Medium': 1,
      'Medium': 1,
      'P1 - High': 2,
      'High': 2,
      'P0 - Critical': 3,
      'Urgent': 3,
      'Critical': 4
    };
    return priorityMap[notionPriority] || 1;
  }

  /**
   * Map Linear state to Notion status
   */
  mapStateToNotion(linearState) {
    const stateMap = {
      'backlog': 'Backlog',
      'unstarted': 'To Do',
      'started': 'In Progress',
      'completed': 'Done',
      'canceled': 'Blocked'
    };
    
    const stateType = linearState.type?.toLowerCase() || linearState.toLowerCase();
    return stateMap[stateType] || 'To Do';
  }

  /**
   * Map Notion status to Linear state type
   */
  mapStatusToLinear(notionStatus) {
    const statusMap = {
      'Backlog': 'backlog',
      'To Do': 'unstarted',
      'In Progress': 'started',
      'Review': 'started',
      'Done': 'completed',
      'Blocked': 'canceled'
    };
    
    return statusMap[notionStatus] || 'unstarted';
  }
}

module.exports = { LinearHelperExtended };

