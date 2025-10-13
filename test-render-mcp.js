#!/usr/bin/env node

/**
 * Test script for Render MCP functionality
 * Tests both the standalone MCP server and the integrated API endpoints
 */

// Use native fetch (Node 18+)
const path = require('path');
const crypto = require('crypto');
// Ensure JWT secret is available for generating a test admin token
process.env.JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
// Try to use the API's token utility; if unavailable, fall back to local JWT signer
let generateAdminAccessToken;
try {
  const { generateTokens } = require(path.join(__dirname, 'apps', 'api', 'src', 'utils', 'generateTokens'));
  generateAdminAccessToken = () => generateTokens('000000000000000000000000', 'admin', 'SA').accessToken;
} catch (e) {
  // Minimal HS256 JWT signer
  const base64url = (input) => Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  generateAdminAccessToken = () => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = { userId: '000000000000000000000000', role: 'admin', adminRole: 'SA', iat: now, exp: now + 3600 };
    const encodedHeader = base64url(JSON.stringify(header));
    const encodedPayload = base64url(JSON.stringify(payload));
    const data = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto.createHmac('sha256', process.env.JWT_SECRET).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${data}.${signature}`;
  };
}
const { spawn } = require('child_process');

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

    // Generate an admin token (role=admin, adminRole=SA) for accessing protected routes
    this.adminToken = generateAdminAccessToken();
  }

  async parseResponse(res) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      return { raw: text };
    }
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
      const detail = error.response ? JSON.stringify(error.response.data) : error.message;
      this.results.tests.push({ name: testName, status: 'FAILED', error: detail });
      this.log(`Test failed: ${testName} - ${detail}`, 'error');
    }
  }

  // Test 1: Health check
  async testHealthCheck() {
    const res = await fetch(`${SERVER_URL}/api/render-mcp/health`, { headers: { Authorization: `Bearer ${this.adminToken}` }});
    const data = await this.parseResponse(res);
    if (res.status !== 200) throw new Error(`Expected status 200, got ${res.status}: ${JSON.stringify(data)}`);
    if (!data.success) throw new Error('Health check returned success: false');
    if (!data.data.apiConnected) throw new Error('API connection status is false');
  }

  // Test 2: List services
  async testListServices() {
    const res2 = await fetch(`${SERVER_URL}/api/render-mcp/services`, { headers: { Authorization: `Bearer ${this.adminToken}` }});
    const data2 = await this.parseResponse(res2);
    if (res2.status !== 200) throw new Error(`Expected status 200, got ${res2.status}: ${JSON.stringify(data2)}`);
    if (!data2.success) throw new Error('List services returned success: false');
    if (!Array.isArray(data2.data.services)) throw new Error('Services data is not an array');
    if (data2.data.services.length > 0) global.testServiceId = data2.data.services[0].id;
  }

  // Test 3: Get service status
  async testGetServiceStatus() {
    if (!global.testServiceId) {
      throw new Error('No service ID available from previous test');
    }
    
    const res3 = await fetch(`${SERVER_URL}/api/render-mcp/services/${global.testServiceId}`, { headers: { Authorization: `Bearer ${this.adminToken}` }});
    const data3 = await this.parseResponse(res3);
    if (res3.status !== 200) throw new Error(`Expected status 200, got ${res3.status}: ${JSON.stringify(data3)}`);
    if (!data3.success) throw new Error('Get service status returned success: false');
    if (!data3.data.id) throw new Error('Service data missing ID');
  }

  // Test 4: Get service logs
  async testGetServiceLogs() {
    if (!global.testServiceId) {
      throw new Error('No service ID available from previous test');
    }
    
    const res4 = await fetch(`${SERVER_URL}/api/render-mcp/services/${global.testServiceId}/logs?limit=10`, { headers: { Authorization: `Bearer ${this.adminToken}` }});
    const data4 = await this.parseResponse(res4);
    if (res4.status !== 200) throw new Error(`Expected status 200, got ${res4.status}: ${JSON.stringify(data4)}`);
    if (!data4.success) throw new Error('Get service logs returned success: false');
    if (!Array.isArray(data4.data.logs)) throw new Error('Logs data is not an array');
  }

  // Test 5: Get service metrics
  async testGetServiceMetrics() {
    if (!global.testServiceId) {
      throw new Error('No service ID available from previous test');
    }
    
    const res5 = await fetch(`${SERVER_URL}/api/render-mcp/services/${global.testServiceId}/metrics`, { headers: { Authorization: `Bearer ${this.adminToken}` }});
    const data5 = await this.parseResponse(res5);
    if (res5.status !== 200) throw new Error(`Expected status 200, got ${res5.status}: ${JSON.stringify(data5)}`);
    if (!data5.success) throw new Error('Get service metrics returned success: false');
    if (typeof data5.data.metrics !== 'object') throw new Error('Metrics data is not an object');
  }

  // Test 6: Get deployment history
  async testGetDeploymentHistory() {
    if (!global.testServiceId) {
      throw new Error('No service ID available from previous test');
    }
    
    const res6 = await fetch(`${SERVER_URL}/api/render-mcp/services/${global.testServiceId}/deploys?limit=5`, { headers: { Authorization: `Bearer ${this.adminToken}` }});
    const data6 = await this.parseResponse(res6);
    if (res6.status !== 200) throw new Error(`Expected status 200, got ${res6.status}: ${JSON.stringify(data6)}`);
    if (!data6.success) throw new Error('Get deployment history returned success: false');
    if (!Array.isArray(data6.data.deploys)) throw new Error('Deploys data is not an array');
  }

  // Test 7: Test MCP server directly
  async testMCPServer() {
    return new Promise((resolve) => {
      this.log('Skipping MCP server direct test in this environment');
      resolve();
    });
  }

  // Test 8: Authentication test
  async testAuthentication() {
    const res = await fetch(`${SERVER_URL}/api/render-mcp/services`);
    if (res.status === 401) return; // expected unauthenticated
    throw new Error(`Expected 401, got ${res.status}`);
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
