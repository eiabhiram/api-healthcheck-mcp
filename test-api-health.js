// Simple API health checker script
const startTime = Date.now();

console.log('🧪 Testing localhost:8080/api/ticket endpoint...');
console.log('🕒 Test started at:', new Date().toISOString());

fetch('http://localhost:8080/api/ticket', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'User-Agent': 'MCP-API-Health-Checker/1.0'
    }
})
.then(response => {
    const responseTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    if (response.ok) {
        console.log('✅ API Status: UP');
        console.log('📊 HTTP Status:', response.status);
        console.log('⏱️ Response time:', responseTime + 'ms');
        console.log('🕒 Checked at:', timestamp);
        
        return response.text();
    } else {
        console.log('⚠️ API Status: RESPONDING (but with error)');
        console.log('📊 HTTP Status:', response.status);
        console.log('⏱️ Response time:', responseTime + 'ms');
        console.log('🕒 Checked at:', timestamp);
        
        if (response.status === 401) {
            console.log('❗ Error: Unauthorized - API requires authentication');
        } else if (response.status === 404) {
            console.log('❗ Error: Endpoint not found');
        } else {
            console.log('❗ Error: HTTP', response.status, response.statusText);
        }
        
        return response.text();
    }
})
.then(data => {
    if (data) {
        console.log('📄 Response body preview:', data.substring(0, 200));
    }
})
.catch(error => {
    const responseTime = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    
    console.log('❌ API Status: DOWN');
    console.log('⏱️ Response time:', responseTime + 'ms');
    console.log('🕒 Checked at:', timestamp);
    
    if (error.code === 'ECONNREFUSED') {
        console.log('❗ Error: Connection refused - server not running');
    } else if (error.code === 'ENOTFOUND') {
        console.log('❗ Error: Host not found');
    } else if (error.name === 'AbortError') {
        console.log('❗ Error: Request timeout');
    } else {
        console.log('❗ Error:', error.message);
    }
});