# LUDUS Platform

LUDUS is a social activity discovery platform that connects users with local experiences and vendors in Saudi Arabia.

## 🚀 Getting Started

For a comprehensive guide on how to set up the project for development, deploy it to production, and for a general overview of the project, please refer to our documentation.

- **[Project Overview](./docs/overview.md)**: A high-level overview of the project, its architecture, and its goals.
- **[Setup and Deployment](./docs/setup.md)**: A detailed guide on how to set up the development environment and deploy the application.
- **[Tasks and Roadmap](./docs/tasks.md)**: A comprehensive list of tasks and the project roadmap.

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account

### Installation
```bash
# Clone and install dependencies
npm install
cd client && npm install
cd ../server && npm install
```

### Environment Setup
Create `.env` files in both the `client` and `server` directories. You can use the `.env.example` files as a template.

### Start Development Servers
```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend  
cd client && npm start
```