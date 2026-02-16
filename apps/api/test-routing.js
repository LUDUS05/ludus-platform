const app = require('./src/app');
const request = require('supertest');

async function test() {
    console.log('Testing /health...');
    const res1 = await request(app).get('/health');
    console.log('/health status:', res1.status, res1.body);

    console.log('Testing /api/debug...');
    const res2 = await request(app).get('/api/debug');
    console.log('/api/debug status:', res2.status, res2.body);

    if (res2.status === 404) {
        console.log('FAIL: /api/debug is 404');
    } else {
        console.log('SUCCESS: /api/debug is', res2.status);
    }

    process.exit(0);
}

test().catch(err => {
    console.error(err);
    process.exit(1);
});
