// 🎮 Real HTTP Server Load Test
const http = require('http');
const fs = require('fs');
const path = require('path');

// Read the game file
const gameHTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Simple HTTP server
const server = http.createServer((req, res) => {
    const start = Date.now();
    
    // Route handling
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(gameHTML);
    } else if (req.url === '/api/status') {
        // Simulated API endpoint
        const response = {
            online: Math.floor(Math.random() * 1000) + 2000,
            status: 'healthy',
            timestamp: Date.now()
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
    
    const responseTime = Date.now() - start;
    return responseTime;
});

const PORT = 8888;
const CONCURRENT_USERS = 1000;
const TEST_DURATION = 30000; // 30 seconds

let requests = 0;
let successes = 0;
let failures = 0;
let totalResponseTime = 0;
let minResponse = Infinity;
let maxResponse = 0;
let responses = [];

server.listen(PORT, () => {
    console.log(`\n🚀 HTTP Server started on port ${PORT}`);
    console.log(`📊 Starting load test: ${CONCURRENT_USERS} concurrent users, ${TEST_DURATION/1000}s duration\n`);
    
    const startTime = Date.now();
    
    // Simulate concurrent users
    const userPromises = [];
    for (let i = 0; i < CONCURRENT_USERS; i++) {
        userPromises.push(simulateUser(i, startTime));
    }
    
    // Progress reporter
    const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / TEST_DURATION) * 100);
        const rps = (requests / (elapsed / 1000)).toFixed(0);
        process.stdout.write(`\r   Progress: ${progress.toFixed(0)}% | Requests: ${requests.toLocaleString()} | RPS: ${rps} | Success: ${successes}`);
    }, 500);
    
    Promise.all(userPromises).then(() => {
        clearInterval(progressInterval);
        
        const duration = Date.now() - startTime;
        const rps = requests / (duration / 1000);
        const avgResponse = totalResponseTime / requests;
        
        console.log('\n\n' + '='.repeat(70));
        console.log('📊 HTTP SERVER LOAD TEST RESULTS');
        console.log('='.repeat(70));
        
        console.log('\n🎯 PERFORMANCE:');
        console.log(`   Duration:           ${duration}ms`);
        console.log(`   Total Requests:     ${requests.toLocaleString()}`);
        console.log(`   Requests/Second:    ${rps.toFixed(2)}`);
        console.log(`   Success Rate:       ${((successes / requests) * 100).toFixed(2)}%`);
        
        console.log('\n⏱️  RESPONSE TIMES:');
        console.log(`   Average:            ${avgResponse.toFixed(3)}ms`);
        console.log(`   Minimum:            ${minResponse.toFixed(3)}ms`);
        console.log(`   Maximum:            ${maxResponse.toFixed(3)}ms`);
        console.log(`   Median:             ${getMedian(responses).toFixed(3)}ms`);
        console.log(`   P95:                ${getPercentile(responses, 95).toFixed(3)}ms`);
        console.log(`   P99:                ${getPercentile(responses, 99).toFixed(3)}ms`);
        
        console.log('\n📈 THROUGHPUT:');
        const throughputMB = (requests * 50 / 1024 / 1024).toFixed(2); // ~50KB per HTML request
        console.log(`   Data Transferred:   ${throughputMB} MB`);
        console.log(`   Bandwidth Used:     ${(throughputMB * 1024 / (duration / 1000)).toFixed(2)} KB/s`);
        
        console.log('\n🎯 VERDICT:');
        const passed = rps > 1000 && avgResponse < 50 && failures < requests * 0.01;
        if (passed) {
            console.log('   🟢 EXCELLENT - Handles 1000+ concurrent users easily!');
        } else if (rps > 500 && avgResponse < 100) {
            console.log('   🟡 GOOD - Can handle moderate load');
        } else {
            console.log('   🔴 NEEDS OPTIMIZATION');
        }
        
        console.log('\n' + '='.repeat(70));
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            config: { port: PORT, users: CONCURRENT_USERS, duration: TEST_DURATION },
            results: {
                duration, requests, successes, failures,
                rps, avgResponse, minResponse, maxResponse,
                median: getMedian(responses),
                p95: getPercentile(responses, 95),
                p99: getPercentile(responses, 99)
            }
        };
        fs.writeFileSync('http-load-test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 Report saved to http-load-test-report.json');
        
        server.close();
        process.exit(0);
    });
});

async function simulateUser(userId, startTime) {
    const userStart = Date.now();
    
    while (Date.now() - startTime < TEST_DURATION) {
        try {
            const response = await makeRequest(`http://localhost:${PORT}/`);
            requests++;
            successes++;
            totalResponseTime += response;
            responses.push(response);
            minResponse = Math.min(minResponse, response);
            maxResponse = Math.max(maxResponse, response);
            
            // Random delay between requests
            await sleep(Math.random() * 50);
        } catch (error) {
            requests++;
            failures++;
        }
    }
}

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve(Date.now() - start);
            });
        }).on('error', reject);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getMedian(arr) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function getPercentile(arr, percentile) {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.floor(percentile / 100 * sorted.length);
    return sorted[index] || sorted[sorted.length - 1];
}
