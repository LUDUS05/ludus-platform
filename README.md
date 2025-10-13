# LUDUS Platform - Monorepo

**Version:** 1.0.0  
**Status:** Development  
**Package Manager:** pnpm

## 🏗️ Architecture Overview

LUDUS is a comprehensive social activity platform built as a monorepo with the following structure:

```
ludus-platform/
├── apps/                    # Applications
│   ├── web/                # React frontend (Next.js)
│   ├── api/                # Node.js backend (Express)
│   └── ai-agents/          # Python AI agents (FastAPI)
├── packages/               # Shared packages
│   ├── shared-types/       # TypeScript types & interfaces
│   └── shared-utils/       # Utility functions
├── tools/                  # Development tools
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js:** >=18.0.0
- **pnpm:** >=8.0.0
- **Python:** >=3.9.0 (for AI agents)
- **MongoDB:** >=6.0.0
- **Redis:** >=6.0.0

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development servers
pnpm dev
```

### Development Commands

```bash
# Start all services
pnpm dev

# Start specific services
pnpm dev:web      # Frontend only
pnpm dev:api      # Backend only
pnpm dev:ai       # AI agents only

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Type checking
pnpm type-check
```

## 📦 Package Structure

### Applications

#### `@ludus/web` - Frontend Application
- **Technology:** React 19.1, TypeScript, Tailwind CSS
- **Features:** Arabic-first RTL design, GSAP animations, i18n
- **Port:** 3000

#### `@ludus/api` - Backend API
- **Technology:** Node.js, Express, MongoDB, Redis
- **Features:** RESTful API, authentication, payment processing
- **Port:** 5000

#### `@ludus/ai-agents` - AI Services
- **Technology:** Python, FastAPI, LangChain
- **Features:** Recommendation engine, content generation
- **Port:** 8001

### Shared Packages

#### `@ludus/shared-types` - Type Definitions
- TypeScript interfaces and types
- Shared across all applications
- Auto-generated from API schemas

#### `@ludus/shared-utils` - Utility Functions
- Common utility functions
- Validation helpers
- Formatting utilities
- Business logic helpers

## 🛠️ Development Workflow

### Adding Dependencies

```bash
# Add to specific package
pnpm --filter @ludus/web add react-query

# Add to root (affects all packages)
pnpm add -w typescript

# Add dev dependency to specific package
pnpm --filter @ludus/api add -D jest
```

### Building Packages

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @ludus/shared-types build

# Build in dependency order
pnpm --filter './packages/*' build
```

### Running Scripts

```bash
# Run script in specific package
pnpm --filter @ludus/api test

# Run script in all packages
pnpm run --recursive test

# Run script in parallel
pnpm run --parallel dev
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ludus
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
FIREBASE_PROJECT_ID=your-firebase-project

# Payment
MOYASAR_API_KEY=your-moyasar-key
MOYASAR_PUBLISHABLE_KEY=your-moyasar-publishable-key

# External Services
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### TypeScript Configuration

Each package has its own `tsconfig.json` that extends from the root configuration:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## 📋 Available Scripts

### Root Level Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start all development servers |
| `build` | Build all packages |
| `test` | Run all tests |
| `lint` | Lint all packages |
| `type-check` | Type check all packages |
| `clean` | Clean all build artifacts |
| `changeset` | Create a changeset |
| `version-packages` | Version packages |
| `release` | Publish packages |

### Package-Specific Scripts

Each package has its own scripts defined in its `package.json`:

- **Web:** `start`, `build`, `test`, `lint`, `type-check`
- **API:** `start`, `dev`, `build`, `test`, `seed`
- **AI Agents:** `start`, `dev`, `test`, `lint`, `format`

## 🚀 Deployment

### Production Build

```bash
# Build all packages
pnpm build

# Start production servers
pnpm start
```

### Docker Deployment

```bash
# Build Docker images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Frontend Components](./docs/components.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing Guide](./docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@ludus.sa or join our Slack channel.

---

**Built with ❤️ for the Saudi Arabian market**
