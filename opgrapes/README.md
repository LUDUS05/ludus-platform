# 🍇 OPGrapes

A modern monorepo project built with Turbo, featuring a Next.js web application and Express API backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 9+
- Git

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd opgrapes

# Install dependencies
npm install

# Start development servers
npm run dev:all
```

## 📁 Project Structure

```
opgrapes/
├── apps/
│   ├── api/          # Express.js API backend
│   └── web/          # Next.js web application
├── packages/
│   └── ui/           # Shared UI components
├── scripts/           # Development and CI scripts
└── .github/          # GitHub Actions workflows
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start all services in development mode
- `npm run dev:web` - Start only the web application
- `npm run dev:api` - Start only the API backend
- `npm run dev:all` - Start both services concurrently

### Building & Testing
- `npm run build` - Build all packages and applications
- `npm run test` - Run all tests
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint on all code
- `npm run format` - Format code with Prettier

### CI Testing (Local)
- `npm run test:ci:local` - Run local CI simulation (Linux/macOS)
- `npm run test:ci:local:win` - Run local CI simulation (Windows)

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### E2E Tests
```bash
# Install Playwright browsers
npx playwright install --with-deps

# Run E2E tests
npm --workspace apps/web run e2e
```

## 🚀 CI/CD

The project includes a comprehensive GitHub Actions CI workflow that:

- ✅ Runs on all pushes to `main` and pull requests
- ✅ Installs dependencies with npm caching
- ✅ Runs linting and type checking
- ✅ Builds all packages and applications
- ✅ Runs unit tests
- ✅ Starts services and runs E2E tests
- ✅ Caches Playwright browsers for faster builds
- ✅ Uploads test reports as artifacts

### Local CI Testing

To test the CI workflow locally before pushing:

**Linux/macOS:**
```bash
npm run test:ci:local
```

**Windows:**
```powershell
npm run test:ci:local:win
```

## 🔧 Configuration

### Environment Variables

- `NODE_ENV` - Environment mode (development, test, production)
- `PORT` - Port for services (API: 4000, Web: 3000)
- `BASE_URL` - Base URL for E2E tests

### Ports

- **API**: 4000 (configurable via `PORT` env var)
- **Web**: 3000 (Next.js default)

## 📦 Workspaces

This project uses npm workspaces and Turbo for efficient monorepo management:

- **apps/api**: Express.js backend with TypeScript and Vitest
- **apps/web**: Next.js 15 application with React 19 and Playwright
- **packages/ui**: Shared UI components library

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 4000 are available
2. **Dependencies**: Run `npm install` in the root directory
3. **TypeScript errors**: Run `npm run typecheck` to identify issues
4. **E2E test failures**: Check if services are running on correct ports

### Development Tips

- Use `npm run dev:all` to start both services simultaneously
- Check service health at `http://localhost:4000/health` (API) and `http://localhost:3000` (Web)
- Use the local CI test scripts to verify changes before pushing

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run local tests: `npm run test:ci:local`
4. Push and create a pull request
5. Ensure CI passes before merging

## 📄 License

[Add your license here]

---

**Note**: This project is configured to only accept pushes to the `main` branch. All development should be done through feature branches and pull requests.
