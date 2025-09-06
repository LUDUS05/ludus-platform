# LUDUS AI Agents Hub

Python-based Agents Hub consisting of:
- FastAPI service (`api/`) exposing health and chat endpoints
- Streamlit UI (`ui/`) providing a chat interface
- Shared requirements in `requirements.txt`

## Quick Start

```bash
python -m venv venv && source venv/bin/activate
pip install -r agents/requirements.txt
uvicorn agents.api.main:app --reload --port 8081
# In another terminal
streamlit run agents/ui/app.py --server.port 8501
```

Health check: `GET /health`

## Environment Variables
- REDIS_URL (e.g., `redis://default:<password>@<host>:<port>`)
- OLLAMA_HOST (optional, default `http://localhost:11434`)
- AGENTS_API_URL (for UI to call API)

## Test
```bash
bash ./test-agents.sh
```

## Deployment
Containers are provided via `Dockerfile.api` and `Dockerfile.ui`. Configure services in `render.yaml`.
