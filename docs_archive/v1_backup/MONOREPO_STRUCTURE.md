# LUDUS Platform - Monorepo Structure

**Version:** 1.0  
**Last Updated:** January 27, 2025  
**Status:** Production Ready  

## 📋 Overview

This document outlines the complete monorepo structure for the LUDUS platform, including package organization, build scripts, dependency management, and development workflows.

## 🏗️ Repository Structure

```
ludus-platform/
├── 📁 apps/                          # Application packages
│   ├── 📁 api/                       # Backend API (Express.js + Node.js)
│   │   ├── 📁 src/
│   │   │   ├── 📁 controllers/       # API controllers
│   │   │   ├── 📁 models/            # Database models
│   │   │   ├── 📁 routes/            # API routes
│   │   │   ├── 📁 middleware/        # Express middleware
│   │   │   ├── 📁 services/          # Business logic services
│   │   │   ├── 📁 utils/             # Utility functions
│   │   │   ├── 📁 config/            # Configuration files
│   │   │   └── 📄 app.js             # Express app setup
│   │   ├── 📁 tests/                 # API tests
│   │   ├── 📄 package.json           # API dependencies
│   │   ├── 📄 Dockerfile             # API Docker configuration
│   │   └── 📄 .env.example           # API environment variables
│   │
│   ├── 📁 web/                       # Frontend Web App (React + TypeScript)
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/        # React components
│   │   │   │   ├── 📁 common/        # Shared components
│   │   │   │   ├── 📁 auth/          # Authentication components
│   │   │   │   ├── 📁 activities/    # Activity-related components
│   │   │   │   ├── 📁 bookings/      # Booking components
│   │   │   │   └── 📁 admin/         # Admin components
│   │   │   ├── 📁 pages/             # Page components
│   │   │   ├── 📁 services/          # API services
│   │   │   ├── 📁 hooks/             # Custom React hooks
│   │   │   ├── 📁 utils/             # Utility functions
│   │   │   ├── 📁 styles/            # Global styles
│   │   │   ├── 📁 locales/           # Internationalization
│   │   │   └── 📄 App.js             # Main App component
│   │   ├── 📁 public/                # Static assets
│   │   ├── 📁 tests/                 # Frontend tests
│   │   ├── 📄 package.json           # Web dependencies
│   │   ├── 📄 Dockerfile             # Web Docker configuration
│   │   └── 📄 vite.config.js         # Vite configuration
│   │
│   ├── 📁 admin/                     # Admin Dashboard (React Admin)
│   │   ├── 📁 src/
│   │   │   ├── 📁 components/        # Admin components
│   │   │   ├── 📁 pages/             # Admin pages
│   │   │   ├── 📁 services/          # Admin API services
│   │   │   └── 📄 App.js             # Admin App component
│   │   ├── 📁 tests/                 # Admin tests
│   │   ├── 📄 package.json           # Admin dependencies
│   │   └── 📄 Dockerfile             # Admin Docker configuration
│   │
│   └── 📁 ai-agents/                 # AI Agents (Python + FastAPI)
│       ├── 📁 api/                   # FastAPI application
│       ├── 📁 ui/                    # Streamlit UI
│       ├── 📁 tests/                 # AI tests
│       ├── 📄 requirements.txt       # Python dependencies
│       ├── 📄 Dockerfile.api         # API Docker configuration
│       └── 📄 Dockerfile.ui          # UI Docker configuration
│
├── 📁 packages/                      # Shared packages
│   ├── 📁 shared-types/              # TypeScript type definitions
│   │   ├── 📁 src/
│   │   │   ├── 📁 api/               # API types
│   │   │   ├── 📁 models/            # Database model types
│   │   │   └── 📁 common/            # Common types
│   │   ├── 📄 package.json           # Types package
│   │   └── 📄 tsconfig.json          # TypeScript config
│   │
│   ├── 📁 shared-utils/              # Shared utility functions
│   │   ├── 📁 src/
│   │   │   ├── 📁 validation/        # Validation utilities
│   │   │   ├── 📁 formatting/        # Formatting utilities
│   │   │   ├── 📁 constants/         # Shared constants
│   │   │   └── 📁 helpers/           # Helper functions
│   │   ├── 📄 package.json           # Utils package
│   │   └── 📄 tsconfig.json          # TypeScript config
│   │
│   └── 📁 shared-config/             # Shared configuration
│       ├── 📁 eslint/                # ESLint configurations
│       ├── 📁 prettier/              # Prettier configurations
│       ├── 📁 typescript/            # TypeScript configurations
│       ├── 📁 jest/                  # Jest configurations
│       └── 📄 package.json           # Config package
│
├── 📁 tools/                         # Development tools
│   ├── 📁 scripts/                   # Build and deployment scripts
│   │   ├── 📄 build.js               # Build script
│   │   ├── 📄 deploy.js              # Deployment script
│   │   ├── 📄 test.js                # Test runner script
│   │   └── 📄 setup-dev.js           # Development setup script
│   │
│   ├── 📁 generators/                # Code generators
│   │   ├── 📄 component.js           # Component generator
│   │   ├── 📄 page.js                # Page generator
│   │   └── 📄 api.js                 # API generator
│   │
│   └── 📁 mcp/                       # MCP (Model Context Protocol) tools
│       ├── 📄 render-mcp-server.js   # Render MCP server
│       └── 📄 test-render-mcp.js     # MCP testing script
│
├── 📁 docs/                          # Documentation
│   ├── 📄 TECHNICAL_SPECIFICATIONS.md
│   ├── 📄 API_SPECIFICATION.yaml
│   ├── 📄 MONGODB_ATLAS_SETUP.md
│   ├── 📄 MONOREPO_STRUCTURE.md
│   └── 📄 DEPLOYMENT_GUIDE.md
│
├── 📁 .github/                       # GitHub workflows
│   ├── 📁 workflows/
│   │   ├── 📄 ci.yml                 # Continuous Integration
│   │   ├── 📄 cd.yml                 # Continuous Deployment
│   │   ├── 📄 test.yml               # Testing workflow
│   │   └── 📄 security.yml           # Security scanning
│   │
│   └── 📁 ISSUE_TEMPLATE/
│       ├── 📄 bug_report.md
│       ├── 📄 feature_request.md
│       └── 📄 pull_request_template.md
│
├── 📁 .vscode/                       # VS Code configuration
│   ├── 📄 settings.json              # Workspace settings
│   ├── 📄 extensions.json            # Recommended extensions
│   └── 📄 launch.json                # Debug configurations
│
├── 📁 scripts/                       # Root-level scripts
│   ├── 📄 setup-dev.sh               # Development setup
│   ├── 📄 build-all.sh               # Build all packages
│   ├── 📄 test-all.sh                # Test all packages
│   └── 📄 deploy.sh                  # Deployment script
│
├── 📄 package.json                   # Root package.json
├── 📄 pnpm-workspace.yaml            # PNPM workspace configuration
├── 📄 docker-compose.dev.yml         # Development Docker Compose
├── 📄 docker-compose.prod.yml        # Production Docker Compose
├── 📄 .env.example                   # Environment variables template
├── 📄 .gitignore                     # Git ignore rules
├── 📄 .eslintrc.js                   # ESLint configuration
├── 📄 .prettierrc                    # Prettier configuration
├── 📄 tsconfig.json                  # Root TypeScript configuration
├── 📄 jest.config.js                 # Jest configuration
└── 📄 README.md                      # Project README
```

## 📦 Package Configuration

### **Root Package.json**

```json
{
  "name": "ludus-platform",
  "version": "1.0.0",
  "description": "LUDUS Social Activity Platform - Monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:api\" \"npm run dev:web\" \"npm run dev:admin\"",
    "dev:api": "cd apps/api && npm run dev",
    "dev:web": "cd apps/web && npm run dev",
    "dev:admin": "cd apps/admin && npm run dev",
    "dev:ai": "cd apps/ai-agents && python -m uvicorn api.main:app --reload",
    "dev:docker": "docker-compose -f docker-compose.dev.yml up",
    "build": "npm run build:packages && npm run build:apps",
    "build:packages": "npm run build --workspaces --if-present",
    "build:apps": "npm run build --workspace=apps/api --workspace=apps/web --workspace=apps/admin",
    "test": "npm run test:packages && npm run test:apps",
    "test:packages": "npm run test --workspaces --if-present",
    "test:apps": "npm run test --workspace=apps/api --workspace=apps/web --workspace=apps/admin",
    "lint": "npm run lint:packages && npm run lint:apps",
    "lint:packages": "npm run lint --workspaces --if-present",
    "lint:apps": "npm run lint --workspace=apps/api --workspace=apps/web --workspace=apps/admin",
    "lint:fix": "npm run lint:fix:packages && npm run lint:fix:apps",
    "lint:fix:packages": "npm run lint:fix --workspaces --if-present",
    "lint:fix:apps": "npm run lint:fix --workspace=apps/api --workspace=apps/web --workspace=apps/admin",
    "format": "prettier --write \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{js,jsx,ts,tsx,json,md}\"",
    "clean": "npm run clean:packages && npm run clean:apps",
    "clean:packages": "npm run clean --workspaces --if-present",
    "clean:apps": "npm run clean --workspace=apps/api --workspace=apps/web --workspace=apps/admin",
    "setup": "node scripts/setup-dev.js",
    "deploy": "node scripts/deploy.js",
    "seed": "cd apps/api && npm run seed",
    "migrate": "cd apps/api && npm run migrate:up",
    "migrate:down": "cd apps/api && npm run migrate:down"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "concurrently": "^8.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-prettier": "^5.0.0",
    "husky": "^8.0.0",
    "jest": "^29.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "pnpm@8.0.0"
}
```

### **PNPM Workspace Configuration**

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

## 🔧 Build System

### **TypeScript Configuration**

#### **Root tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@shared/types": ["./packages/shared-types/src"],
      "@shared/utils": ["./packages/shared-utils/src"],
      "@shared/config": ["./packages/shared-config/src"]
    }
  },
  "include": [
    "apps/*/src/**/*",
    "packages/*/src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "coverage"
  ]
}
```

### **ESLint Configuration**

#### **Root .eslintrc.js**
```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn'
  },
  overrides: [
    {
      files: ['apps/web/**/*', 'apps/admin/**/*'],
      env: {
        browser: true
      },
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended'
      ],
      plugins: ['react', 'react-hooks'],
      settings: {
        react: {
          version: 'detect'
        }
      }
    },
    {
      files: ['apps/api/**/*'],
      env: {
        node: true
      }
    }
  ]
};
```

### **Prettier Configuration**

#### **Root .prettierrc**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

## 🧪 Testing Configuration

### **Jest Configuration**

#### **Root jest.config.js**
```javascript
module.exports = {
  projects: [
    {
      displayName: 'api',
      testMatch: ['<rootDir>/apps/api/tests/**/*.test.js'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/packages/shared-config/jest/setup.js']
    },
    {
      displayName: 'web',
      testMatch: ['<rootDir>/apps/web/tests/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/packages/shared-config/jest/setup.js']
    },
    {
      displayName: 'admin',
      testMatch: ['<rootDir>/apps/admin/tests/**/*.test.{js,jsx,ts,tsx}'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/packages/shared-config/jest/setup.js']
    }
  ],
  collectCoverageFrom: [
    'apps/*/src/**/*.{js,jsx,ts,tsx}',
    'packages/*/src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

## 🐳 Docker Configuration

### **Development Docker Compose**

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Database Services
  mongodb:
    image: mongo:7.0
    container_name: ludus-mongodb-dev
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: ludus_dev
    volumes:
      - mongodb_data:/data/db
    networks:
      - ludus-network

  redis:
    image: redis:7.2-alpine
    container_name: ludus-redis-dev
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - ludus-network

  # Backend Services
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.dev
    container_name: ludus-api-dev
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/ludus_dev?authSource=admin
      REDIS_URL: redis://redis:6379
    volumes:
      - ./apps/api:/app
      - /app/node_modules
    depends_on:
      - mongodb
      - redis
    networks:
      - ludus-network

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.dev
    container_name: ludus-web-dev
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    depends_on:
      - api
    networks:
      - ludus-network

  admin:
    build:
      context: ./apps/admin
      dockerfile: Dockerfile.dev
    container_name: ludus-admin-dev
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      REACT_APP_API_URL: http://localhost:5000
    volumes:
      - ./apps/admin:/app
      - /app/node_modules
    depends_on:
      - api
    networks:
      - ludus-network

  ai-agents:
    build:
      context: ./apps/ai-agents
      dockerfile: Dockerfile.api
    container_name: ludus-ai-dev
    restart: unless-stopped
    ports:
      - "8081:8081"
    environment:
      REDIS_URL: redis://redis:6379
    volumes:
      - ./apps/ai-agents:/app
    depends_on:
      - redis
    networks:
      - ludus-network

volumes:
  mongodb_data:
  redis_data:

networks:
  ludus-network:
    driver: bridge
```

## 🚀 Development Workflow

### **Getting Started**

1. **Clone Repository**
   ```bash
   git clone https://github.com/ludus-platform/ludus-platform.git
   cd ludus-platform
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development**
   ```bash
   # Start all services
   npm run dev
   
   # Or start individual services
   npm run dev:api
   npm run dev:web
   npm run dev:admin
   ```

### **Available Scripts**

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all development servers |
| `npm run build` | Build all packages |
| `npm run test` | Run all tests |
| `npm run lint` | Lint all packages |
| `npm run format` | Format all code |
| `npm run clean` | Clean all build artifacts |
| `npm run setup` | Setup development environment |
| `npm run deploy` | Deploy to production |

### **Package Management**

#### **Adding Dependencies**
```bash
# Add to specific package
npm install <package> --workspace=apps/api

# Add to root (dev dependency)
npm install -D <package>

# Add to all packages
npm install <package> --workspaces
```

#### **Running Scripts**
```bash
# Run in specific package
npm run <script> --workspace=apps/api

# Run in all packages
npm run <script> --workspaces
```

## 📋 Best Practices

### **Code Organization**
- Keep related code together
- Use consistent naming conventions
- Follow the established folder structure
- Keep components small and focused

### **Dependency Management**
- Use exact versions for production dependencies
- Keep dev dependencies up to date
- Avoid duplicate dependencies across packages
- Use workspace dependencies when possible

### **Testing**
- Write tests for all new features
- Maintain high test coverage
- Use consistent testing patterns
- Test both happy path and edge cases

### **Documentation**
- Keep README files updated
- Document API changes
- Use JSDoc for functions
- Maintain architecture documentation

---

**Document Status:** ✅ **COMPLETED**  
**Next Review:** February 27, 2025  
**Maintainer:** LUDUS Development Team
