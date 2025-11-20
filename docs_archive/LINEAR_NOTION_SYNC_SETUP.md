# Linear to Notion Sync Automation Setup

This guide explains how to set up automatic synchronization between Linear issues and your Notion Tasks database.

## Overview

The sync system automatically:
- Creates new Notion tasks when Linear issues are created
- Updates Notion tasks when Linear issues are modified
- Archives Notion tasks when Linear issues are deleted
- Maps Linear statuses and priorities to Notion fields

## Prerequisites

1. **Linear API Key**: Get from Linear Settings > API
2. **Notion API Key**: Get from Notion Integrations
3. **Notion Database ID**: Your LUDUS Tasks database ID
4. **Webhook Secret**: For webhook verification (optional but recommended)

## Setup Steps

### 1. Install Dependencies

```bash
cd apps/api
npm install @linear/sdk @notionhq/client
```

### 2. Environment Variables

Add these to your `.env` file:

```env
# Linear Integration
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINEAR_WEBHOOK_SECRET=your_webhook_secret_here

# Notion Integration
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_TASKS_DATABASE_ID=9efe5329-42c7-49d1-920e-c927f4d4602c
```

### 3. Configure Notion Database

Ensure your Notion database has these properties:
- **Task Name** (Title)
- **Status** (Select): Backlog, In Progress, Done, Blocked
- **Priority** (Select): Critical, High, Medium
- **Source Link** (Rich Text)
- **Due Date** (Date)
- **Assignee** (Rich Text)

### 4. Set Up Linear Webhook

1. Go to Linear Settings > API
2. Click "Create Webhook"
3. Set URL: `https://your-domain.com/api/linear-webhook`
4. Select events: `Issue Created`, `Issue Updated`, `Issue Removed`
5. Copy the webhook secret to your environment variables

### 5. Test the Integration

#### Test Webhook Endpoint
```bash
curl -X GET https://your-domain.com/api/linear-webhook/test
```

#### Check Sync Status
```bash
curl -X GET https://your-domain.com/api/linear-webhook/status
```

#### Manual Sync
```bash
curl -X POST https://your-domain.com/api/linear-webhook/sync
```

## API Endpoints

### Webhook Handler
- **POST** `/api/linear-webhook` - Receives Linear webhooks
- **GET** `/api/linear-webhook/test` - Test endpoint
- **GET** `/api/linear-webhook/status` - Check sync status
- **POST** `/api/linear-webhook/sync` - Manual sync trigger

### Query Parameters for Manual Sync
- `teamId` - Filter by Linear team ID
- `status` - Filter by issue status
- `limit` - Max issues to sync (default: 100)

## Status Mapping

| Linear Status | Notion Status |
|---------------|---------------|
| Backlog       | Backlog       |
| Todo          | Backlog       |
| In Progress   | In Progress   |
| Done          | Done          |
| Completed     | Done          |
| Canceled      | Blocked       |
| Cancelled     | Blocked       |

## Priority Mapping

| Linear Priority | Notion Priority |
|-----------------|-----------------|
| 0 (No priority) | None            |
| 1 (Urgent)      | Critical        |
| 2 (High)        | High            |
| 3 (Medium)      | Medium          |
| 4 (Low)         | Medium          |

## Monitoring

The system logs all operations:
- Webhook events received
- Tasks created/updated/archived
- Sync operations
- Errors and warnings

Check your application logs for sync activity.

## Troubleshooting

### Common Issues

1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check Linear webhook configuration

2. **Tasks not syncing**
   - Verify API keys are correct
   - Check Notion database permissions
   - Review application logs

3. **Status mapping issues**
   - Ensure Notion database has correct status options
   - Check status mapping in sync service

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Security

- Webhook signature verification (if secret provided)
- Rate limiting on sync endpoints
- API key validation
- Input sanitization

## Performance

- Rate limiting: 300ms between Linear API calls
- Batch processing for large syncs
- Memory optimization for large datasets
- Automatic retry on failures

## Customization

You can modify the sync behavior by editing:
- `apps/api/src/services/linearNotionSync.js` - Core sync logic
- `apps/api/src/controllers/linearWebhookController.js` - Webhook handling
- Status and priority mappings in the sync service

## Support

For issues or questions:
1. Check application logs
2. Verify configuration
3. Test individual components
4. Review Linear and Notion API documentation
