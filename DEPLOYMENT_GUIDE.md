#### 9. Vercel Schema Validation Error
**Problem**: `vercel.json` schema validation fails with "should NOT have additional property 'rootDirectory'" error

**Solution**: The `rootDirectory` property is not valid in Vercel's schema. For monorepo setups:

1. **Remove invalid properties** from `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "cd opgrapes && npm install && npm run build",
  "outputDirectory": "opgrapes/apps/web/.next",
  "installCommand": "cd opgrapes && npm install",
  "framework": "nextjs"
}
```

2. **Create `.vercelignore`** to exclude unnecessary files:
```
# Ignore everything except the web app
opgrapes/apps/api/
opgrapes/apps/mobile/
opgrapes/packages/
opgrapes/.turbo/
opgrapes/node_modules/
opgrapes/.next/
opgrapes/dist/
opgrapes/coverage/
opgrapes/.env*
opgrapes/*.log
opgrapes/.DS_Store
opgrapes/Thumbs.db

# Only include the web app
!opgrapes/apps/web/
!opgrapes/package.json
!opgrapes/turbo.json
!opgrapes/tsconfig.json
```

3. **Set Root Directory in Vercel Dashboard**: Go to Project Settings → General → Root Directory and set it to `opgrapes/apps/web`

## 🚀 Deployment Checklist
