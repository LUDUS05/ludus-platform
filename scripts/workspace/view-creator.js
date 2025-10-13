#!/usr/bin/env node

/**
 * View Creator Utility
 * Creates different types of Notion database views programmatically
 * Note: Notion API currently has limitations on view creation.
 * This module provides the structure and will be used when API supports it.
 */

class ViewCreator {
  constructor(notionHelper) {
    this.notion = notionHelper;
  }

  /**
   * Create a table view
   * Table view shows data in rows and columns
   */
  createTableView(config) {
    const {
      name,
      filter = null,
      sorts = [],
      properties = []
    } = config;

    return {
      type: 'table',
      name: name,
      table: {
        table_properties: properties.map(prop => ({
          property: prop.name,
          visible: prop.visible !== false,
          width: prop.width || 150
        }))
      },
      filter: filter,
      sorts: sorts
    };
  }

  /**
   * Create a board view (Kanban)
   * Groups items by a select or status property
   */
  createBoardView(config) {
    const {
      name,
      groupBy,
      filter = null,
      sorts = [],
      hideEmptyGroups = false
    } = config;

    return {
      type: 'board',
      name: name,
      board: {
        group_by: groupBy,
        hide_empty_groups: hideEmptyGroups
      },
      filter: filter,
      sorts: sorts
    };
  }

  /**
   * Create a list view
   * Simple list without grouping
   */
  createListView(config) {
    const {
      name,
      filter = null,
      sorts = []
    } = config;

    return {
      type: 'list',
      name: name,
      list: {},
      filter: filter,
      sorts: sorts
    };
  }

  /**
   * Create a calendar view
   * Shows items on a calendar based on date property
   */
  createCalendarView(config) {
    const {
      name,
      dateProperty,
      filter = null
    } = config;

    return {
      type: 'calendar',
      name: name,
      calendar: {
        property: dateProperty
      },
      filter: filter
    };
  }

  /**
   * Create a gallery view
   * Shows items as cards with cover images
   */
  createGalleryView(config) {
    const {
      name,
      cardSize = 'medium',
      coverProperty = null,
      filter = null,
      sorts = []
    } = config;

    const galleryConfig = {
      type: 'gallery',
      name: name,
      gallery: {
        card_size: cardSize
      },
      filter: filter,
      sorts: sorts
    };

    if (coverProperty) {
      galleryConfig.gallery.cover_property = coverProperty;
    }

    return galleryConfig;
  }

  /**
   * Create a timeline view
   * Shows items on a timeline based on date range
   */
  createTimelineView(config) {
    const {
      name,
      startDateProperty,
      endDateProperty = null,
      filter = null
    } = config;

    const timelineConfig = {
      type: 'timeline',
      name: name,
      timeline: {
        start_date_property: startDateProperty
      },
      filter: filter
    };

    if (endDateProperty) {
      timelineConfig.timeline.end_date_property = endDateProperty;
    }

    return timelineConfig;
  }

  /**
   * Build filter for views
   */
  buildFilter = {
    /**
     * Single condition filter
     */
    property: (propertyName, condition) => ({
      property: propertyName,
      ...condition
    }),

    /**
     * AND filter (all conditions must be true)
     */
    and: (...filters) => ({
      and: filters
    }),

    /**
     * OR filter (at least one condition must be true)
     */
    or: (...filters) => ({
      or: filters
    }),

    // Text filters
    textEquals: (text) => ({ text: { equals: text } }),
    textContains: (text) => ({ text: { contains: text } }),
    textStartsWith: (text) => ({ text: { starts_with: text } }),
    textEndsWith: (text) => ({ text: { ends_with: text } }),
    textIsEmpty: () => ({ text: { is_empty: true } }),
    textIsNotEmpty: () => ({ text: { is_not_empty: true } }),

    // Number filters
    numberEquals: (num) => ({ number: { equals: num } }),
    numberGreaterThan: (num) => ({ number: { greater_than: num } }),
    numberLessThan: (num) => ({ number: { less_than: num } }),
    numberGreaterThanOrEqual: (num) => ({ number: { greater_than_or_equal_to: num } }),
    numberLessThanOrEqual: (num) => ({ number: { less_than_or_equal_to: num } }),

    // Checkbox filters
    checkboxEquals: (checked) => ({ checkbox: { equals: checked } }),

    // Select filters
    selectEquals: (value) => ({ select: { equals: value } }),
    selectIsEmpty: () => ({ select: { is_empty: true } }),
    selectIsNotEmpty: () => ({ select: { is_not_empty: true } }),

    // Multi-select filters
    multiSelectContains: (value) => ({ multi_select: { contains: value } }),
    multiSelectDoesNotContain: (value) => ({ multi_select: { does_not_contain: value } }),

    // Status filters
    statusEquals: (value) => ({ status: { equals: value } }),
    statusIsEmpty: () => ({ status: { is_empty: true } }),
    statusIsNotEmpty: () => ({ status: { is_not_empty: true } }),

    // Date filters
    dateEquals: (date) => ({ date: { equals: date } }),
    dateBefore: (date) => ({ date: { before: date } }),
    dateAfter: (date) => ({ date: { after: date } }),
    dateOnOrBefore: (date) => ({ date: { on_or_before: date } }),
    dateOnOrAfter: (date) => ({ date: { on_or_after: date } }),
    dateIsEmpty: () => ({ date: { is_empty: true } }),
    dateIsNotEmpty: () => ({ date: { is_not_empty: true } }),
    datePastWeek: () => ({ date: { past_week: {} } }),
    datePastMonth: () => ({ date: { past_month: {} } }),
    datePastYear: () => ({ date: { past_year: {} } }),
    dateNextWeek: () => ({ date: { next_week: {} } }),
    dateNextMonth: () => ({ date: { next_month: {} } }),
    dateNextYear: () => ({ date: { next_year: {} } }),

    // People filters
    peopleContains: (userId) => ({ people: { contains: userId } }),
    peopleDoesNotContain: (userId) => ({ people: { does_not_contain: userId } }),
    peopleIsEmpty: () => ({ people: { is_empty: true } }),
    peopleIsNotEmpty: () => ({ people: { is_not_empty: true } }),

    // Relation filters
    relationContains: (pageId) => ({ relation: { contains: pageId } }),
    relationDoesNotContain: (pageId) => ({ relation: { does_not_contain: pageId } }),
    relationIsEmpty: () => ({ relation: { is_empty: true } }),
    relationIsNotEmpty: () => ({ relation: { is_not_empty: true } })
  };

  /**
   * Build sort for views
   */
  buildSort = {
    /**
     * Sort by property
     */
    property: (propertyName, direction = 'ascending') => ({
      property: propertyName,
      direction: direction
    }),

    /**
     * Sort by created time
     */
    createdTime: (direction = 'descending') => ({
      timestamp: 'created_time',
      direction: direction
    }),

    /**
     * Sort by last edited time
     */
    lastEditedTime: (direction = 'descending') => ({
      timestamp: 'last_edited_time',
      direction: direction
    })
  };

  /**
   * Get predefined view configurations for Projects database
   */
  getProjectsViews() {
    return [
      {
        name: 'Active Projects',
        type: 'board',
        config: this.createBoardView({
          name: 'Active Projects',
          groupBy: 'Phase',
          filter: this.buildFilter.and(
            this.buildFilter.property('Status', this.buildFilter.statusEquals('In Progress'))
          ),
          sorts: [this.buildSort.property('Priority', 'ascending')]
        })
      },
      {
        name: 'My Projects',
        type: 'table',
        config: this.createTableView({
          name: 'My Projects',
          filter: this.buildFilter.property('Owner', this.buildFilter.peopleIsNotEmpty()),
          sorts: [this.buildSort.property('Due Date', 'ascending')]
        })
      },
      {
        name: 'Budget Overview',
        type: 'table',
        config: this.createTableView({
          name: 'Budget Overview',
          sorts: [this.buildSort.property('Budget SAR', 'descending')],
          properties: [
            { name: 'Project Name', visible: true },
            { name: 'Budget SAR', visible: true },
            { name: 'Actual Cost SAR', visible: true },
            { name: 'Progress', visible: true },
            { name: 'Status', visible: true }
          ]
        })
      },
      {
        name: 'Timeline View',
        type: 'timeline',
        config: this.createTimelineView({
          name: 'Timeline View',
          startDateProperty: 'Start Date',
          endDateProperty: 'End Date'
        })
      },
      {
        name: 'Risk Matrix',
        type: 'board',
        config: this.createBoardView({
          name: 'Risk Matrix',
          groupBy: 'Risk Level',
          sorts: [this.buildSort.property('Priority', 'ascending')]
        })
      },
      {
        name: 'Milestones',
        type: 'table',
        config: this.createTableView({
          name: 'Milestones',
          filter: this.buildFilter.property('Milestone', this.buildFilter.checkboxEquals(true)),
          sorts: [this.buildSort.property('End Date', 'ascending')]
        })
      }
    ];
  }

  /**
   * Get predefined view configurations for Tasks database
   */
  getTasksViews() {
    return [
      {
        name: 'Sprint Board',
        type: 'board',
        config: this.createBoardView({
          name: 'Sprint Board',
          groupBy: 'Status',
          sorts: [this.buildSort.property('Priority', 'ascending')]
        })
      },
      {
        name: 'My Tasks',
        type: 'list',
        config: this.createListView({
          name: 'My Tasks',
          filter: this.buildFilter.property('Assignee', this.buildFilter.peopleIsNotEmpty()),
          sorts: [this.buildSort.property('Due Date', 'ascending')]
        })
      },
      {
        name: 'By Project',
        type: 'table',
        config: this.createTableView({
          name: 'By Project',
          sorts: [this.buildSort.property('Project', 'ascending')]
        })
      },
      {
        name: 'Overdue Tasks',
        type: 'list',
        config: this.createListView({
          name: 'Overdue Tasks',
          filter: this.buildFilter.and(
            this.buildFilter.property('Due Date', this.buildFilter.dateIsNotEmpty()),
            this.buildFilter.property('Status', this.buildFilter.statusEquals('Done'))
          ),
          sorts: [this.buildSort.property('Due Date', 'ascending')]
        })
      },
      {
        name: 'Backlog',
        type: 'table',
        config: this.createTableView({
          name: 'Backlog',
          filter: this.buildFilter.property('Status', this.buildFilter.statusEquals('Backlog')),
          sorts: [this.buildSort.property('Priority', 'ascending')]
        })
      },
      {
        name: 'This Week',
        type: 'calendar',
        config: this.createCalendarView({
          name: 'This Week',
          dateProperty: 'Due Date'
        })
      }
    ];
  }

  /**
   * Get predefined view configurations for Operations database
   */
  getOperationsViews() {
    return [
      {
        name: 'Daily Standup',
        type: 'list',
        config: this.createListView({
          name: 'Daily Standup',
          filter: this.buildFilter.property('Due Date', this.buildFilter.dateEquals('today')),
          sorts: [this.buildSort.property('Priority', 'ascending')]
        })
      },
      {
        name: 'Team Workload',
        type: 'board',
        config: this.createBoardView({
          name: 'Team Workload',
          groupBy: 'Assignee',
          sorts: [this.buildSort.property('Due Date', 'ascending')]
        })
      },
      {
        name: 'Weekly Planning',
        type: 'calendar',
        config: this.createCalendarView({
          name: 'Weekly Planning',
          dateProperty: 'Due Date'
        })
      },
      {
        name: 'Process Tasks',
        type: 'table',
        config: this.createTableView({
          name: 'Process Tasks',
          filter: this.buildFilter.property('Task Type', this.buildFilter.selectEquals('Process Improvement')),
          sorts: [this.buildSort.property('Priority', 'ascending')]
        })
      },
      {
        name: 'Blocked Items',
        type: 'list',
        config: this.createListView({
          name: 'Blocked Items',
          filter: this.buildFilter.property('Blockers', this.buildFilter.textIsNotEmpty()),
          sorts: [this.buildSort.property('Priority', 'ascending')]
        })
      }
    ];
  }

  /**
   * Get predefined view configurations for Budget database
   */
  getBudgetViews() {
    return [
      {
        name: 'Budget Overview',
        type: 'table',
        config: this.createTableView({
          name: 'Budget Overview',
          sorts: [this.buildSort.property('Category', 'ascending')]
        })
      },
      {
        name: 'Variance Analysis',
        type: 'table',
        config: this.createTableView({
          name: 'Variance Analysis',
          sorts: [this.buildSort.property('Variance %', 'descending')],
          properties: [
            { name: 'Item Name', visible: true },
            { name: 'Planned Amount SAR', visible: true },
            { name: 'Actual Amount SAR', visible: true },
            { name: 'Variance SAR', visible: true },
            { name: 'Variance %', visible: true }
          ]
        })
      },
      {
        name: 'By Category',
        type: 'board',
        config: this.createBoardView({
          name: 'By Category',
          groupBy: 'Category',
          sorts: [this.buildSort.property('Planned Amount SAR', 'descending')]
        })
      },
      {
        name: 'Pending Approvals',
        type: 'list',
        config: this.createListView({
          name: 'Pending Approvals',
          filter: this.buildFilter.property('Approval Status', this.buildFilter.selectEquals('Pending')),
          sorts: [this.buildSort.createdTime('ascending')]
        })
      },
      {
        name: 'Monthly Spending',
        type: 'table',
        config: this.createTableView({
          name: 'Monthly Spending',
          sorts: [this.buildSort.property('Budget Period', 'descending')]
        })
      },
      {
        name: 'KPI Dashboard',
        type: 'table',
        config: this.createTableView({
          name: 'KPI Dashboard',
          filter: this.buildFilter.property('KPI Category', this.buildFilter.selectIsNotEmpty()),
          sorts: [this.buildSort.property('KPI Category', 'ascending')]
        })
      }
    ];
  }

  /**
   * Get predefined view configurations for Documents database
   */
  getDocumentsViews() {
    return [
      {
        name: 'By Type',
        type: 'board',
        config: this.createBoardView({
          name: 'By Type',
          groupBy: 'Document Type',
          sorts: [this.buildSort.lastEditedTime('descending')]
        })
      },
      {
        name: 'Recent Updates',
        type: 'table',
        config: this.createTableView({
          name: 'Recent Updates',
          sorts: [this.buildSort.lastEditedTime('descending')]
        })
      },
      {
        name: 'Review Due',
        type: 'list',
        config: this.createListView({
          name: 'Review Due',
          filter: this.buildFilter.property('Next Review Date', this.buildFilter.dateIsNotEmpty()),
          sorts: [this.buildSort.property('Next Review Date', 'ascending')]
        })
      },
      {
        name: 'My Documents',
        type: 'gallery',
        config: this.createGalleryView({
          name: 'My Documents',
          cardSize: 'medium',
          filter: this.buildFilter.property('Owner', this.buildFilter.peopleIsNotEmpty()),
          sorts: [this.buildSort.lastEditedTime('descending')]
        })
      },
      {
        name: 'Compliance Docs',
        type: 'table',
        config: this.createTableView({
          name: 'Compliance Docs',
          filter: this.buildFilter.property('Category', this.buildFilter.selectEquals('Legal')),
          sorts: [this.buildSort.property('Next Review Date', 'ascending')]
        })
      },
      {
        name: 'Archive',
        type: 'table',
        config: this.createTableView({
          name: 'Archive',
          filter: this.buildFilter.property('Status', this.buildFilter.statusEquals('Archived')),
          sorts: [this.buildSort.lastEditedTime('descending')]
        })
      }
    ];
  }

  /**
   * Get predefined view configurations for Team database
   */
  getTeamViews() {
    return [
      {
        name: 'Team Overview',
        type: 'gallery',
        config: this.createGalleryView({
          name: 'Team Overview',
          cardSize: 'medium',
          filter: this.buildFilter.property('Status', this.buildFilter.selectEquals('Active')),
          sorts: [this.buildSort.property('Name', 'ascending')]
        })
      },
      {
        name: 'By Department',
        type: 'board',
        config: this.createBoardView({
          name: 'By Department',
          groupBy: 'Department',
          sorts: [this.buildSort.property('Name', 'ascending')]
        })
      },
      {
        name: 'Capacity Planning',
        type: 'table',
        config: this.createTableView({
          name: 'Capacity Planning',
          filter: this.buildFilter.property('Status', this.buildFilter.selectEquals('Active')),
          sorts: [this.buildSort.property('Capacity %', 'ascending')],
          properties: [
            { name: 'Name', visible: true },
            { name: 'Role', visible: true },
            { name: 'Department', visible: true },
            { name: 'Capacity %', visible: true },
            { name: 'Current Projects', visible: true }
          ]
        })
      },
      {
        name: 'Role Matrix',
        type: 'board',
        config: this.createBoardView({
          name: 'Role Matrix',
          groupBy: 'Role',
          sorts: [this.buildSort.property('Name', 'ascending')]
        })
      },
      {
        name: 'Project Assignments',
        type: 'table',
        config: this.createTableView({
          name: 'Project Assignments',
          filter: this.buildFilter.property('Current Projects', this.buildFilter.relationIsNotEmpty()),
          sorts: [this.buildSort.property('Name', 'ascending')]
        })
      },
      {
        name: 'Contact Directory',
        type: 'table',
        config: this.createTableView({
          name: 'Contact Directory',
          sorts: [this.buildSort.property('Name', 'ascending')],
          properties: [
            { name: 'Name', visible: true },
            { name: 'Email', visible: true },
            { name: 'Phone', visible: true },
            { name: 'Role', visible: true },
            { name: 'Department', visible: true },
            { name: 'Location', visible: true }
          ]
        })
      }
    ];
  }

  /**
   * Log view information (for documentation purposes since API doesn't support view creation yet)
   */
  logViewConfigurations(databaseName, views) {
    console.log(`\n📋 View Configurations for ${databaseName}:`);
    views.forEach((view, index) => {
      console.log(`   ${index + 1}. ${view.name} (${view.type})`);
    });
    console.log('   ℹ️  Note: Views must be created manually in Notion UI (API limitation)');
  }
}

module.exports = { ViewCreator };

// Allow running standalone for documentation
if (require.main === module) {
  const viewCreator = new ViewCreator(null);
  
  console.log('📊 LUDUS Workspace View Configurations');
  console.log('=====================================\n');
  
  viewCreator.logViewConfigurations('Projects Master', viewCreator.getProjectsViews());
  viewCreator.logViewConfigurations('Development Tasks', viewCreator.getTasksViews());
  viewCreator.logViewConfigurations('Operations & Team Tasks', viewCreator.getOperationsViews());
  viewCreator.logViewConfigurations('Budget & Financial Tracking', viewCreator.getBudgetViews());
  viewCreator.logViewConfigurations('Documents Hub', viewCreator.getDocumentsViews());
  viewCreator.logViewConfigurations('Team Directory', viewCreator.getTeamViews());
  
  console.log('\n✅ View configurations documented successfully!');
  console.log('📝 These configurations can be used for future API updates or manual setup.');
}

