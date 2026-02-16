const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔍 LUDUS Platform - MCP Status Checker');
console.log('=====================================');
console.log('');

// Check MCP configuration
function checkMCPConfig() {
    console.log('📋 Checking MCP Configuration...');
    
    try {
        const config = JSON.parse(fs.readFileSync('.cursor/mcp.json', 'utf8'));
        const servers = Object.keys(config.mcpServers);
        
        console.log(`✅ Found ${servers.length} MCP servers configured:`);
        servers.forEach(server => {
            console.log(`   - ${server}`);
        });
        console.log('');
        
        return config;
    } catch (error) {
        console.log('❌ Error reading MCP configuration:', error.message);
        return null;
    }
}

// Check environment variables
function checkEnvironmentVariables() {
    console.log('🔑 Checking Environment Variables...');
    
    const requiredVars = {
        'RENDER_API_TOKEN': 'Render deployment management',
        'LINEAR_API_KEY': 'Linear issue tracking',
        'GITHUB_TOKEN': 'GitHub repository management',
        'NOTION_TOKEN': 'Notion documentation'
    };
    
    const status = {};
    
    Object.entries(requiredVars).forEach(([varName, description]) => {
        const value = process.env[varName];
        if (value && value !== `YOUR_${varName}_HERE`) {
            console.log(`✅ ${varName}: Configured (${description})`);
            status[varName] = 'configured';
        } else {
            console.log(`❌ ${varName}: Not configured (${description})`);
            status[varName] = 'missing';
        }
    });
    
    console.log('');
    return status;
}

// Test MCP server connectivity
async function testMCPServer(serverName, command, args, env) {
    return new Promise((resolve) => {
        console.log(`🧪 Testing ${serverName} MCP server...`);
        
        const child = spawn(command, args, {
            env: { ...process.env, ...env },
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let output = '';
        let error = '';
        
        child.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            error += data.toString();
        });
        
        // Timeout after 10 seconds
        const timeout = setTimeout(() => {
            child.kill();
            console.log(`⏰ ${serverName}: Timeout (10s)`);
            resolve('timeout');
        }, 10000);
        
        child.on('close', (code) => {
            clearTimeout(timeout);
            if (code === 0) {
                console.log(`✅ ${serverName}: Working`);
                resolve('working');
            } else {
                console.log(`❌ ${serverName}: Error (code ${code})`);
                if (error) {
                    console.log(`   Error: ${error.substring(0, 100)}...`);
                }
                resolve('error');
            }
        });
        
        // Send a test command
        child.stdin.write('{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0.0"}}}\n');
        child.stdin.end();
    });
}

// Main function
async function main() {
    const config = checkMCPConfig();
    if (!config) return;
    
    const envStatus = checkEnvironmentVariables();
    
    console.log('🧪 Testing MCP Server Connectivity...');
    console.log('');
    
    const testResults = {};
    
    // Test each configured server
    for (const [serverName, serverConfig] of Object.entries(config.mcpServers)) {
        const { command, args, env } = serverConfig;
        const result = await testMCPServer(serverName, command, args, env);
        testResults[serverName] = result;
    }
    
    console.log('');
    console.log('📊 MCP Status Summary:');
    console.log('=====================');
    
    Object.entries(testResults).forEach(([server, status]) => {
        const statusIcon = status === 'working' ? '✅' : status === 'timeout' ? '⏰' : '❌';
        console.log(`${statusIcon} ${server}: ${status}`);
    });
    
    console.log('');
    console.log('🔧 Environment Variables Status:');
    console.log('================================');
    
    Object.entries(envStatus).forEach(([varName, status]) => {
        const statusIcon = status === 'configured' ? '✅' : '❌';
        console.log(`${statusIcon} ${varName}: ${status}`);
    });
    
    console.log('');
    console.log('📋 Recommendations:');
    console.log('==================');
    
    if (envStatus.GITHUB_TOKEN === 'missing') {
        console.log('🔑 Set up GitHub token: https://github.com/settings/tokens');
    }
    
    if (envStatus.NOTION_TOKEN === 'missing') {
        console.log('🔑 Set up Notion token: https://www.notion.so/my-integrations');
    }
    
    const workingServers = Object.values(testResults).filter(s => s === 'working').length;
    const totalServers = Object.keys(testResults).length;
    
    if (workingServers === totalServers) {
        console.log('🎉 All MCP servers are working! You can now use AI assistance for:');
        console.log('   - Linear: Issue management and project tracking');
        console.log('   - Render: Deployment and service management');
        console.log('   - GitHub: Repository and code management');
        console.log('   - Notion: Documentation and project specs');
    } else {
        console.log('⚠️  Some MCP servers need attention. Check the errors above.');
    }
    
    console.log('');
    console.log('💡 Next Steps:');
    console.log('1. Fix any missing environment variables');
    console.log('2. Restart Cursor to reload MCP configuration');
    console.log('3. Test MCP tools in Cursor interface');
    console.log('4. Begin LUDUS platform development with AI assistance!');
}

main().catch(console.error);
