# LUDUS Platform - Monorepo

**Version:** 1.0.0  
**Status:** Development  
**Package Manager:** pnpm
**Market:** Saudi Arabia (Arabic-First)

---

## 🏗️ Architecture Overview

LUDUS is a comprehensive social activity platform built as a monorepo. It leverages a modern tech stack designed for scalability, security, and cultural integration.

```text
ludus-platform/
├── apps/                    # Core Applications
│   ├── web/                # React/Next.js Frontend (Arabic-First)
│   ├── api/                # Node.js/Express Backend
│   └── ai-agents/          # Python/FastAPI AI Services
├── packages/               # Shared Workspace Packages
│   ├── shared-types/       # TypeScript Definitions
│   └── shared-utils/       # Utility Functions & Logic
├── scripts/                # Deployment, Testing & Utility Scripts
└── docs/                   # Consolidated Documentation
```

## 📚 Documentation

Detailed documentation is available in the [docs/](./docs) directory:

| Document | Description |
|----------|-------------|
| [Constitution](./docs/CONSTITUTION.md) | Immutable development and cultural principles |
| [Technical Architecture](./docs/TECHNICAL_ARCHITECTURE.md) | System design and implementation blueprint |
| [API Specifications](./docs/API_SPECIFICATIONS.md) | RESTful API endpoints and integration patterns |
| [Database Schema](./docs/DATABASE_SCHEMA.md) | MongoDB design and data models |
| [Security Requirements](./docs/SECURITY_REQUIREMENTS.md) | Security framework and compliance |

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Python >= 3.9.0 (for AI agents)
- MongoDB >= 6.0.0
- Redis >= 6.0.0

### Installation & Setup

```bash
# Install dependencies
pnpm install

# Setup development environment
pnpm run setup

# Start all development services
pnpm dev
```

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services (Web, API, AI) |
| `pnpm build` | Build all packages and apps |
| `pnpm test` | Run tests across the monorepo |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm clean` | Clean build artifacts and node_modules |

## 📦 Service Details

### Frontend (`@ludus/web`)
- **Tech:** React 19, TypeScript, Tailwind CSS
- **Features:** RTL Design, GSAP Animations, i18n
- **Port:** 3000

### Backend (`@ludus/api`)
- **Tech:** Node.js, Express, MongoDB, Redis
- **Features:** JWT Auth, Moyasar Payments, RESTful
- **Port:** 5000

### AI Services (`@ludus/ai-agents`)
- **Tech:** Python, FastAPI, LangChain
- **Features:** Recommendation Engine, Content Generation
- **Port:** 8001

---

**Built with ❤️ for the Saudi Arabian market**
