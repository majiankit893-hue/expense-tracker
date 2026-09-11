const http = require('http');

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting API Endpoint Automated Verification...\n');
  let createdId = null;

  try {
    // 1. GET /api/health
    console.log('Testing GET /api/health...');
    const health = await request('GET', '/api/health');
    console.log(`Status: ${health.status}`, health.body);

    // 2. GET /api/expenses
    console.log('\nTesting GET /api/expenses...');
    const expenses = await request('GET', '/api/expenses');
    console.log(`Status: ${expenses.status}, Count: ${expenses.body.count}`);

    // 3. POST /api/expenses (Invalid validation check)
    console.log('\nTesting POST /api/expenses (Validation Failure)...');
    const invalidPost = await request('POST', '/api/expenses', {
      title: '',
      amount: -50,
      category: 'InvalidCategory',
      type: 'invalid',
    });
    console.log(`Status: ${invalidPost.status}`, invalidPost.body);

    // 4. POST /api/expenses (Valid)
    console.log('\nTesting POST /api/expenses (Valid Creation)...');
    const validPost = await request('POST', '/api/expenses', {
      title: 'Lab Notebook & Pen',
      amount: 150,
      category: 'Education',
      type: 'expense',
      date: '2026-09-11',
      description: 'Bought stationery for CSE lab',
    });
    console.log(`Status: ${validPost.status}`, validPost.body);
    createdId = validPost.body.data ? validPost.body.data.id : null;

    // 5. GET /api/expenses/:id
    if (createdId) {
      console.log(`\nTesting GET /api/expenses/${createdId}...`);
      const getSingle = await request('GET', `/api/expenses/${createdId}`);
      console.log(`Status: ${getSingle.status}`, getSingle.body.data);
    }

    // 6. GET /api/expenses/999999 (404)
    console.log('\nTesting GET /api/expenses/999999 (404 Not Found)...');
    const getNotFound = await request('GET', '/api/expenses/999999');
    console.log(`Status: ${getNotFound.status}`, getNotFound.body);

    // 7. PUT /api/expenses/:id
    if (createdId) {
      console.log(`\nTesting PUT /api/expenses/${createdId}...`);
      const updateRes = await request('PUT', `/api/expenses/${createdId}`, {
        title: 'Lab Notebook & Hardcover Binder',
        amount: 220,
        category: 'Education',
        type: 'expense',
        date: '2026-09-11',
        description: 'Updated stationery purchase',
      });
      console.log(`Status: ${updateRes.status}`, updateRes.body.data);
    }

    // 8. GET /api/summary
    console.log('\nTesting GET /api/summary...');
    const summary = await request('GET', '/api/summary');
    console.log(`Status: ${summary.status}`, summary.body.data);

    // 9. GET /api/analytics
    console.log('\nTesting GET /api/analytics...');
    const analytics = await request('GET', '/api/analytics');
    console.log(`Status: ${analytics.status}`, analytics.body.data);

    // 10. POST /api/ai/chat (Testing AI Assistant questions)
    console.log('\nTesting POST /api/ai/chat ("Where am I spending the most?")...');
    const aiChat1 = await request('POST', '/api/ai/chat', { message: 'Where am I spending the most?' });
    console.log(`Status: ${aiChat1.status}`, aiChat1.body.data);

    console.log('\nTesting POST /api/ai/chat ("How much did I spend on food?")...');
    const aiChat2 = await request('POST', '/api/ai/chat', { message: 'How much did I spend on food?' });
    console.log(`Status: ${aiChat2.status}`, aiChat2.body.data);

    console.log('\nTesting POST /api/ai/chat ("Give me a budget for next month.")...');
    const aiChat3 = await request('POST', '/api/ai/chat', { message: 'Give me a budget for next month.' });
    console.log(`Status: ${aiChat3.status}`, aiChat3.body.data);

    // 11. DELETE /api/expenses/:id
    if (createdId) {
      console.log(`\nTesting DELETE /api/expenses/${createdId}...`);
      const deleteRes = await request('DELETE', `/api/expenses/${createdId}`);
      console.log(`Status: ${deleteRes.status}`, deleteRes.body);
    }

    console.log('\n✅ All API tests executed successfully!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
}

runTests();
