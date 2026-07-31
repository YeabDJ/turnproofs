const http = require('http');

async function testTouchupFlow() {
  console.log('Testing live touchup API endpoints locally...');

  // 1. Test fetching reports list
  const fetch = (await import('node-fetch')).default || globalThis.fetch;
  
  const res = await fetch('http://localhost:3000/api/airbnb/reports');
  console.log('GET /api/airbnb/reports status:', res.status);
  
  if (res.ok) {
    const data = await res.json();
    console.log('Reports count:', data.reports?.length || 0);
    if (data.reports && data.reports.length > 0) {
      const sampleReport = data.reports[0];
      console.log('Sample Report ID:', sampleReport.id);
      console.log('Sample Report Property ID:', sampleReport.property_id);
    }
  }
}

testTouchupFlow().catch(console.error);
