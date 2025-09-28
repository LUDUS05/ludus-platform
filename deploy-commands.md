# Selena-Onboard Deployment Commands

## 1. Deploy Agents Service (Python FastAPI)
```bash
# In Render dashboard for ludus-agents-api service:
# - Ensure Python 3.11+ runtime
# - Ensure requirements.txt includes: pymongo==4.6.0, redis==5.0.8
# - Set environment variables: MONGODB_URI, REDIS_URL, OLLAMA_HOST
# - Deploy from agents/ directory
```

## 2. Deploy Backend Service (Node.js Express)
```bash
# In Render dashboard for ludus-backend-athena service:
# - Ensure Node.js 18+ runtime
# - Set environment variable: AGENTS_API_URL=https://ludus-agents-api.onrender.com
# - Deploy from server/ directory
```

## 3. Deploy Frontend Service (React)
```bash
# In Render dashboard for ludus-frontend service:
# - Ensure Node.js 18+ runtime
# - Set build command: npm run build
# - Deploy from client/ directory
```

## 4. Environment Variables to Configure

### Agents Service (ludus-agents-api):
- MONGODB_URI: [MongoDB connection string]
- REDIS_URL: [Redis connection string]
- OLLAMA_HOST: http://localhost:11434 (or Ollama service URL)
- OLLAMA_MODEL: llama3.1

### Backend Service (ludus-backend-athena):
- AGENTS_API_URL: https://ludus-agents-api.onrender.com
- MONGODB_URI: [Same as agents service]

### Frontend Service (ludus-frontend):
- REACT_APP_API_URL: https://ludus-backend-athena.onrender.com/api
