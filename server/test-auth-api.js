process.env.NODE_ENV = 'test';
import http from 'http';
import app from './server.js';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import User from './models/User.js';
import Expense from './models/Expense.js';

const TEST_PORT = 5099;

const runTests = async () => {
  await connectDB();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(TEST_PORT, resolve));
  console.log(`\n🧪 Test server running on http://localhost:${TEST_PORT}\n`);

  const baseUrl = `http://localhost:${TEST_PORT}`;

  const request = async (path, options = {}) => {
    const { headers = {}, ...restOptions } = options;
    const res = await fetch(`${baseUrl}${path}`, {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    const body = await res.json().catch(() => ({}));
    return { status: res.status, body };
  };

  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} ${details}`);
      failed++;
    }
  };

  try {
    const testId = Date.now();
    const userEmail = `user_${testId}@example.com`;
    const adminEmail = `admin_${testId}@example.com`;
    const password = 'Password123!';

    console.log('--- Auth & Registration Tests ---');

    // 1. Register normal user
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Normal User',
        email: userEmail,
        password: password,
      }),
    });
    assert(regRes.status === 201 && regRes.body.token && regRes.body.data.role === 'user', 'POST /api/auth/register - Register User', JSON.stringify(regRes.body));
    const userToken = regRes.body.token;
    const userId = regRes.body.data?._id;

    // 2. Duplicate registration check
    const dupRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate User',
        email: userEmail,
        password: password,
      }),
    });
    assert(dupRes.status === 400, 'POST /api/auth/register - Reject Duplicate Email', JSON.stringify(dupRes.body));

    // 3. Register admin user
    const adminRegRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Admin User',
        email: adminEmail,
        password: password,
        role: 'admin',
      }),
    });
    assert(adminRegRes.status === 201 && adminRegRes.body.data.role === 'admin', 'POST /api/auth/register - Register Admin User', JSON.stringify(adminRegRes.body));
    const adminToken = adminRegRes.body.token;

    // 4. Login user
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        password: password,
      }),
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login - User Login', JSON.stringify(loginRes.body));

    // 5. Login with invalid password
    const badLoginRes = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: userEmail,
        password: 'wrongpassword',
      }),
    });
    assert(badLoginRes.status === 401, 'POST /api/auth/login - Reject Bad Password', JSON.stringify(badLoginRes.body));

    console.log('\n--- Protected /api/auth/me Tests ---');

    // 6. GET /api/auth/me without token -> 401
    const noTokenRes = await request('/api/auth/me');
    assert(noTokenRes.status === 401, 'GET /api/auth/me - Block Unauthenticated (No Token)', JSON.stringify(noTokenRes.body));

    // 7. GET /api/auth/me with invalid token -> 401
    const badTokenRes = await request('/api/auth/me', {
      headers: { Authorization: 'Bearer invalidtoken123' },
    });
    assert(badTokenRes.status === 401, 'GET /api/auth/me - Block Invalid Token', JSON.stringify(badTokenRes.body));

    // 8. GET /api/auth/me with valid token -> 200
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(meRes.status === 200 && meRes.body.data.email === userEmail, 'GET /api/auth/me - Success With Valid Token', JSON.stringify(meRes.body));

    console.log('\n--- Scoped Expense Tests ---');

    // 9. Create expense for user 1
    const createExpRes = await request('/api/expenses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        title: 'Lunch at Cafe',
        amount: 25.5,
        category: 'Food',
        date: new Date().toISOString(),
      }),
    });
    assert(createExpRes.status === 201 && createExpRes.body.data.user === userId, 'POST /api/expenses - Create Expense Scoped to User', JSON.stringify(createExpRes.body));
    const expenseId = createExpRes.body.data?._id;

    // 10. Get expenses for user 1
    const getExpUser1 = await request('/api/expenses', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(getExpUser1.status === 200 && getExpUser1.body.count >= 1, 'GET /api/expenses - Get User 1 Expenses', `Count: ${getExpUser1.body.count}`);

    // 11. Get expenses for admin user (should NOT contain user 1's expense)
    const getExpAdmin = await request('/api/expenses', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const containsUser1Expense = getExpAdmin.body.data?.some((e) => e._id === expenseId);
    assert(getExpAdmin.status === 200 && !containsUser1Expense, 'GET /api/expenses - Isolation Between Users', `Contains user1 exp: ${containsUser1Expense}`);

    // 12. Admin attempts to get user 1's expense -> 404 (user scoping prevents access)
    const getOtherExp = await request(`/api/expenses/${expenseId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(getOtherExp.status === 404, 'GET /api/expenses/:id - Reject Access to Another User Expense (404)', JSON.stringify(getOtherExp.body));

    // 13. Update expense as user 1
    const updateExpRes = await request(`/api/expenses/${expenseId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        title: 'Fancy Dinner',
        amount: 55.0,
        category: 'Food',
        date: new Date().toISOString(),
      }),
    });
    assert(updateExpRes.status === 200 && updateExpRes.body.data.title === 'Fancy Dinner', 'PUT /api/expenses/:id - Update Own Expense', JSON.stringify(updateExpRes.body));

    // 14. Delete expense as user 1
    const deleteExpRes = await request(`/api/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(deleteExpRes.status === 200, 'DELETE /api/expenses/:id - Delete Own Expense', JSON.stringify(deleteExpRes.body));

    console.log('\n--- Admin RBAC Tests ---');

    // 15. Regular user access /api/admin/users -> 403 Forbidden
    const adminRouteUserRes = await request('/api/admin/users', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(adminRouteUserRes.status === 403, 'GET /api/admin/users - Reject Non-Admin User (403 Forbidden)', JSON.stringify(adminRouteUserRes.body));

    // 16. Admin user access /api/admin/users -> 200 OK
    const adminRouteAdminRes = await request('/api/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminRouteAdminRes.status === 200 && Array.isArray(adminRouteAdminRes.body.data), 'GET /api/admin/users - Allow Admin User (200 OK)', `Count: ${adminRouteAdminRes.body.count}`);

    // Cleanup created test users and expenses
    await User.deleteMany({ email: { $in: [userEmail, adminEmail] } });
    if (expenseId) {
      await Expense.findByIdAndDelete(expenseId);
    }
  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    console.log(`\n========================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);
    server.close();
    await mongoose.connection.close();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
