# 🔑 LUDUS Platform - Token Setup Guide

## Quick Setup Instructions

### 1. GitHub Token (2 minutes)
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "LUDUS Platform MCP"
4. Expiration: 90 days
5. Select these scopes:
   - ✅ repo
   - ✅ workflow  
   - ✅ admin:org
   - ✅ admin:public_key
   - ✅ admin:repo_hook
   - ✅ admin:org_hook
   - ✅ gist
   - ✅ notifications
   - ✅ user
   - ✅ delete_repo
   - ✅ write:discussion
   - ✅ admin:gpg_key
6. Click "Generate token"
7. Copy the token (starts with `ghp_` or `github_pat_`)

### 2. Notion Token (2 minutes)
1. Go to: https://www.notion.so/my-integrations
2. Click "New integration"
3. Name: "LUDUS Platform MCP"
4. Select your workspace
5. Click "Submit"
6. Copy the token (starts with `secret_`)
7. Go to your LUDUS pages in Notion
8. Click "Share" → "Invite" → Select "LUDUS Platform MCP"

### 3. Run Setup Script
```bash
./setup-tokens.sh
```

### 4. Restart Cursor
- Close and reopen Cursor to load new MCP configuration

## Token Formats
- **GitHub**: `ghp_xxxxxxxxxxxxxxxxxxxx` or `github_pat_xxxxxxxxxxxxxxxxxxxx`
- **Notion**: `secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## What This Enables
✅ **Linear MCP**: Already working - Manage all 60 LUDUS tasks  
✅ **GitHub MCP**: Repository management, PR creation, issue tracking  
✅ **Notion MCP**: Documentation, project specs, knowledge base  
✅ **Render MCP**: Already working - Deployment management  

## Troubleshooting
- **Token not working**: Check format and permissions
- **MCP not loading**: Restart Cursor completely
- **Access denied**: Ensure integration has proper permissions

## Security Notes
- Keep tokens secure and private
- Don't commit tokens to git
- Rotate tokens regularly
- Use environment variables for storage
