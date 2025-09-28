# LUDUS Selena AI Service

FastAPI microservice orchestrating 4 specialized Selena AI agents for the LUDUS social activities platform in Saudi Arabia.

## 🎯 Performance Targets

- **Response Time**: <200ms average
- **Concurrency**: 1000+ concurrent requests
- **Uptime**: 99.9% availability
- **Languages**: Arabic (primary) + English

## 🤖 Selena AI Agents

### 1. **Selena Onboard** 🌟
- **Purpose**: User onboarding and registration guidance
- **Capabilities**: Registration assistance, profile setup, platform tutorials
- **Endpoint**: `/agents/onboard`

### 2. **Selena Discover** 🔍  
- **Purpose**: Activity discovery and personalized recommendations
- **Capabilities**: Activity search, location-based suggestions, trending discovery
- **Endpoint**: `/agents/discover`

### 3. **Selena Support** 🎧
- **Purpose**: Customer support and technical assistance
- **Capabilities**: Issue resolution, technical support, booking assistance
- **Endpoint**: `/agents/support`

### 4. **Selena Community** 👥
- **Purpose**: Community building and social connections
- **Capabilities**: Social matching, group coordination, event organization
- **Endpoint**: `/agents/community`

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI API   │    │   Redis Cache   │    │   Ollama AI     │
│   (Port 8081)   │◄──►│   Sessions      │    │   (llama3.2)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4 Selena AI Agents                          │
│  Onboard │ Discover │ Support │ Community                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Redis (for session management)
- Ollama with llama3.2 model (for AI responses)

### Installation

1. **Clone and setup**:
```bash
cd /workspace/agents/selena_ai_service
pip install -r requirements.txt
```

2. **Configure environment**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the service**:
```bash
# Development
uvicorn main:app --reload --host 0.0.0.0 --port 8081

# Production
gunicorn -w 1 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8081
```

### Docker Deployment

```bash
# Build image
docker build -t ludus-selena-ai .

# Run container
docker run -p 8081:8081 \
  -e REDIS_URL=redis://your-redis-url \
  -e OLLAMA_HOST=http://your-ollama-host:11434 \
  ludus-selena-ai
```

## 📋 API Endpoints

### Core Endpoints

- **`GET /health`** - Service health check
- **`GET /health/detailed`** - Detailed system health
- **`GET /agents`** - Get all agent information
- **`POST /chat`** - Universal chat endpoint

### Agent-Specific Endpoints

- **`POST /agents/onboard`** - Onboarding assistance
- **`POST /agents/discover`** - Activity discovery
- **`POST /agents/support`** - Customer support
- **`POST /agents/community`** - Community interactions

### Monitoring Endpoints

- **`GET /performance/metrics`** - Performance metrics
- **`GET /performance/agents/{agent_type}`** - Agent-specific metrics
- **`GET /sessions/{session_id}`** - Session information

## 🔧 Configuration

### Environment Variables

```bash
# Core Configuration
HOST=0.0.0.0
PORT=8081
DEBUG=false

# Redis (Session Management)
REDIS_URL=redis://localhost:6379/0

# Ollama (AI Models)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Performance Tuning
MAX_CONCURRENT_REQUESTS=1000
TARGET_RESPONSE_TIME_MS=200
RATE_LIMIT_REQUESTS=100

# Security
SECRET_KEY=your-secret-key
CORS_ORIGINS=http://localhost:3000,https://*.render.com
```

## 📊 API Usage Examples

### Chat with Onboard Agent

```bash
curl -X POST "http://localhost:8081/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "مرحباً، أريد المساعدة في إعداد حسابي",
    "language": "ar",
    "agent_type": "onboard",
    "session_id": "user123"
  }'
```

### Discover Activities

```bash
curl -X POST "http://localhost:8081/agents/discover" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Find outdoor activities in Riyadh",
    "language": "en",
    "session_id": "user123",
    "discovery_type": "nearby",
    "user_location": {"lat": 24.7136, "lng": 46.6753}
  }'
```

### Get Support

```bash
curl -X POST "http://localhost:8081/agents/support" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "لدي مشكلة في تسجيل الدخول",
    "language": "ar", 
    "session_id": "user123",
    "issue_type": "account",
    "urgency_level": "normal"
  }'
```

## 🧪 Testing

### Run Test Suite

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
python test_service.py

# Run with pytest
pytest tests/ -v
```

### Performance Testing

```bash
# Test response times
curl -w "@curl-format.txt" -s -o /dev/null "http://localhost:8081/health"

# Load testing with hey
hey -n 1000 -c 10 -m POST -H "Content-Type: application/json" \
  -d '{"message":"test","agent_type":"support","language":"ar"}' \
  "http://localhost:8081/chat"
```

## 📈 Monitoring

### Health Checks

- **`/health`** - Basic health status
- **`/health/detailed`** - Comprehensive system health
- **`/performance/metrics`** - Performance metrics
- **`/performance/summary`** - Performance summary

### Metrics Tracked

- Response times per agent
- Request success/failure rates  
- Concurrent request handling
- Redis connection health
- Ollama service availability
- Memory and CPU usage

## 🔒 Security Features

- **Rate Limiting**: Sliding window with burst protection
- **Input Validation**: Comprehensive Pydantic validation
- **Session Security**: Secure session management with Redis
- **CORS Configuration**: Configurable cross-origin policies
- **Error Handling**: Secure error responses without data leakage

## 🌐 Deployment

### Render Deployment

Create `render.yaml`:

```yaml
services:
  - type: web
    name: ludus-selena-ai
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: REDIS_URL
        fromService:
          type: redis
          name: ludus-redis
      - key: OLLAMA_HOST
        value: http://your-ollama-service:11434
```

### Environment Setup

1. **Redis**: Set up Redis Cloud or Redis service
2. **Ollama**: Deploy Ollama service with llama3.2 model
3. **Environment Variables**: Configure all required env vars
4. **Health Checks**: Verify all dependencies are healthy

## 🐛 Troubleshooting

### Common Issues

1. **Slow Response Times**
   - Check Ollama service health
   - Verify Redis connection
   - Monitor system resources

2. **Agent Not Available Errors**
   - Check Ollama model availability
   - Verify agent initialization
   - Check service dependencies

3. **Session Issues**
   - Verify Redis connection
   - Check session expiration settings
   - Review Redis memory usage

### Debug Mode

```bash
# Run in debug mode
DEBUG=true uvicorn main:app --reload --log-level debug
```

## 📚 API Documentation

- **Swagger UI**: `http://localhost:8081/docs`
- **ReDoc**: `http://localhost:8081/redoc`
- **OpenAPI JSON**: `http://localhost:8081/openapi.json`

## 🔄 Development

### Project Structure

```
selena_ai_service/
├── main.py                 # FastAPI application entry point
├── requirements.txt        # Python dependencies
├── Dockerfile             # Container configuration
├── .env.example           # Environment template
├── test_service.py        # Test suite
├── README.md              # This file
├── core/                  # Core infrastructure
│   ├── __init__.py
│   ├── config.py          # Configuration management
│   ├── session_manager.py # Session and conversation history
│   ├── performance_monitor.py # Performance tracking
│   ├── health_checker.py  # Health monitoring
│   ├── rate_limiter.py    # Rate limiting
│   └── error_handler.py   # Error management
└── agents/                # Selena AI Agents
    ├── __init__.py
    ├── base_agent.py       # Base agent interface
    ├── onboard_agent.py    # Onboarding agent
    ├── discover_agent.py   # Discovery agent
    ├── support_agent.py    # Support agent
    └── community_agent.py  # Community agent
```

### Adding New Features

1. **New Agent**: Extend `BaseAgent` class
2. **New Endpoint**: Add to `main.py` with proper validation
3. **New Functionality**: Update agent classes with new methods
4. **Testing**: Add tests to `test_service.py`

## 📄 License

Part of the LUDUS Platform - All rights reserved.

---

**Created**: 2025-09-28 GMT+3 (Riyadh)  
**Version**: 1.0.0  
**Maintainer**: LUDUS Development Team