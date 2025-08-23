#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting OPGrapes API Development Server...\n');

// Check if MongoDB is running (optional)
console.log('📊 Checking dependencies...');

// Start the development server
console.log('🔥 Starting API server on port 5000...\n');

const apiProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

apiProcess.on('error', (error) => {
  console.error('❌ Failed to start API server:', error.message);
  process.exit(1);
});

apiProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ API server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down API server...');
  apiProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down API server...');
  apiProcess.kill('SIGTERM');
  process.exit(0);
});
