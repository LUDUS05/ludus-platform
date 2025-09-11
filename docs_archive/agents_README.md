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
- REDIS_URL (e.g., `redis://default:<password>@<host>:<port>`) for session history
- OLLAMA_HOST (default `http://localhost:11434`)
- OLLAMA_MODEL (default `llama3.1`)
- AGENTS_API_URL (for UI to call API)

## Notes
- If Redis is not configured, sessions work in stateless mode without history persistence.
- If Ollama is unavailable, API falls back to a simple acknowledgement in the selected language.

## Test
```bash
bash ./test-agents.sh
```

## Deployment
Containers are provided via `Dockerfile.api` and `Dockerfile.ui`. Configure services in `render.yaml`.
