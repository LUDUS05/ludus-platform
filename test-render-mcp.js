#!/usr/bin/env node

/**
 * Test script for Render MCP functionality
 * Tests both the standalone MCP server and the integrated API endpoints
 */

const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');

// Configuration
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';
const RENDER_API_TOKEN = process.env.RENDER_API_TOKEN || 'rnd_AjWyMGFA2vmtx6KidKj4TPVLZwpU';

// Test data
const testServiceId = 'test-service-id'; // This will be replaced with actual service ID from API

class RenderMCPTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    try {
      this.log(`Running test: ${testName}`);
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      this.log(`Test passed: ${testName}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`Test failed: ${testName} - ${error.message}`, 'error');
    }
  }

  // Test 1: Health check
  async testHealthCheck() {
    const response = await axios.get(`${SERVER_URL}/api/render-mcp/health`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Health check returned success: false');
    }
    
    if (!response.data.data.apiConnected) {
      throw new Error('API connection status is false');
    }
  }

  // Test 2: List services
  async testListServices() {
    const response = await axios.get(`${SERVER_URL}/api/render-mcp/services`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('List services returned success: false');
    }
    
    if (!Array.isArray(response.data.data.services)) {
      throw new Error('Services data is not an array');
    }
    
    // Store the first service ID for other tests
    if (response.data.data.services.length > 0) {
      global.testServiceId = response.data.data.services[0].id;
    }
  }

  // Test 3: Get service status
  async testGetServiceStatus() {
    if (!global.testServiceId) {
      throw new Error('No service ID available from previous test');
    }
    
    const response = await axios.get(`${SERVER_URL}/api/render-mcp/services/${global.testServiceId}`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Get service status returned success: false');
    }
    
    if (!response.data.data.id) {
      throw new Error('Service data missing ID');
    }
  }

  // Test 4: Get service logs
  async testGetServiceLogs() {
    if (!global.testServiceId) {
      throw new Error('No service ID available from previous test');
    }
    
    const response = await axios.get(`${SERVER_URL}/api/render-mcp/services/${global.testServiceId}/logs?limit=10`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Get service logs returned success: false');
    }
    
    if (!Array.isArray(response.data.data.logs)) {
      throw new Error('Logs data is not an array');
    }
  }

  // Test 5: Get service metrics
  async testGetServiceMetrics() {
    if (!global.testServiceId) {
      throw new Error('No service ID available from previous test');
    }
    
    const response = await axios.get(`${SERVER_URL}/api/render-mcp/services/${global.testServiceId}/metrics`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Get service metrics returned success: false');
    }
    
    if (typeof response.data.data.metrics !== 'object') {
      throw new Error('Metrics data is not an object');
    }
  }

  // Test 6: Get deployment history
  async testGetDeploymentHistory() {
    if (!global.testServiceId) {
      throw new Error('No service ID available from previous test');
    }
    
    const response = await axios.get(`${SERVER_URL}/api/render-mcp/services/${global.testServiceId}/deploys?limit=5`);
    
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    if (!response.data.success) {
      throw new Error('Get deployment history returned success: false');
    }
    
    if (!Array.isArray(response.data.data.deploys)) {
      throw new Error('Deploys data is not an array');
    }
  }

  // Test 7: Test MCP server directly
  async testMCPServer() {
    return new Promise((resolve, reject) => {
      const mcpServerPath = path.join(__dirname, 'scripts', 'render-mcp-server.js');
      const mcpProcess = spawn('node', [mcpServerPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, RENDER_API_TOKEN }
      });

      let output = '';
      let errorOutput = '';

      mcpProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      mcpProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Send a test request to the MCP server
      setTimeout(() => {
        const testRequest = {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {}
        };

        mcpProcess.stdin.write(JSON.stringify(testRequest) + '\n');
      }, 1000);

      // Wait for response
      setTimeout(() => {
        mcpProcess.kill();
        
        if (errorOutput.includes('Render MCP Server started')) {
          resolve();
        } else {
          reject(new Error(`MCP server failed to start: ${errorOutput}`));
        }
      }, 3000);

      mcpProcess.on('error', (error) => {
        reject(new Error(`MCP server process error: ${error.message}`));
      });
    });
  }

  // Test 8: Authentication test
  async testAuthentication() {
    try {
      // This should fail without authentication
      await axios.get(`${SERVER_URL}/api/render-mcp/services`);
      throw new Error('Expected authentication error but request succeeded');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // This is expected - authentication required
        return;
      } else {
        throw new Error(`Unexpected error: ${error.message}`);
      }
    }
  }

  async runAllTests() {
    this.log('Starting Render MCP tests...');
    this.log(`Server URL: ${SERVER_URL}`);
    this.log(`API Token: ${RENDER_API_TOKEN.substring(0, 10)}...`);

    // Note: Authentication tests are skipped for now since we need proper auth tokens
    // In a real scenario, you would need to authenticate first
    
    await this.runTest('Health Check', () => this.testHealthCheck());
    await this.runTest('List Services', () => this.testListServices());
    await this.runTest('Get Service Status', () => this.testGetServiceStatus());
    await this.runTest('Get Service Logs', () => this.testGetServiceLogs());
    await this.runTest('Get Service Metrics', () => this.testGetServiceMetrics());
    await this.runTest('Get Deployment History', () => this.testGetDeploymentHistory());
    await this.runTest('MCP Server Direct Test', () => this.testMCPServer());

    this.printResults();
  }

  printResults() {
    this.log('\n=== TEST RESULTS ===');
    this.log(`Total Tests: ${this.results.passed + this.results.failed}`);
    this.log(`Passed: ${this.results.passed}`, 'success');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    
    if (this.results.failed > 0) {
      this.log('\nFailed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`  - ${test.name}: ${test.error}`, 'error');
        });
    }
    
    this.log('\n=== END RESULTS ===');
    
    // Exit with appropriate code
    process.exit(this.results.failed > 0 ? 1 : 0);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new RenderMCPTester();
  tester.runAllTests().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = RenderMCPTester;
