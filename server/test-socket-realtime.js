import 'dotenv/config';
import http from 'http';
import express from 'express';
import { io as ClientIO } from 'socket.io-client';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { initSocket } from './socket.js';
import User from './models/User.js';
import Expense from './models/Expense.js';
import { createExpense, updateExpense, deleteExpense } from './controllers/expenseController.js';

async function runRealtimeSocketTest() {
  console.log('🚀 Starting Socket.IO Real-Time Integration Test...');

  // 1. Connect DB
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';
  await mongoose.connect(mongoUri);
  console.log('✅ Connected to MongoDB');

  // 2. Setup Express & HTTP Server & Socket.IO
  const app = express();
  app.use(express.json());
  const httpServer = http.createServer(app);
  initSocket(httpServer, {
    origin: '*',
    methods: ['GET', 'POST'],
  });

  const TEST_PORT = 5055;
  await new Promise((resolve) => httpServer.listen(TEST_PORT, resolve));
  console.log(`✅ Test Socket Server running on port ${TEST_PORT}`);

  try {
    // 3. Find or Create Test User
    let testUser = await User.findOne({ email: 'socket-test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Socket Tester',
        email: 'socket-test@example.com',
        password: 'password123',
        role: 'user',
      });
    }

    const token = jwt.sign(
      { id: testUser._id.toString(), role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Test Handshake Rejection with Invalid Token
    console.log('\n🧪 Testing Handshake Rejection with Invalid Token...');
    const rejectedClient = ClientIO(`http://localhost:${TEST_PORT}`, {
      auth: { token: 'invalid.token.here' },
      transports: ['websocket'],
      reconnection: false,
    });

    const rejectionPassed = await new Promise((resolve) => {
      rejectedClient.on('connect_error', (err) => {
        console.log(`✅ Handshake correctly rejected: ${err.message}`);
        rejectedClient.disconnect();
        resolve(true);
      });
      rejectedClient.on('connect', () => {
        console.error('❌ Connection should have been rejected!');
        rejectedClient.disconnect();
        resolve(false);
      });
    });

    if (!rejectionPassed) {
      throw new Error('Socket authentication rejection test failed');
    }

    // 5. Test Handshake Acceptance with Valid Token
    console.log('\n🧪 Testing Handshake Acceptance with Valid Token...');
    const client = ClientIO(`http://localhost:${TEST_PORT}`, {
      auth: { token },
      transports: ['websocket'],
    });

    await new Promise((resolve, reject) => {
      client.on('connect', () => {
        console.log('✅ Socket connected successfully with valid token');
        resolve();
      });
      client.on('connect_error', (err) => {
        reject(new Error(`Failed to connect with valid token: ${err.message}`));
      });
    });

    // 6. Test expense:created & analytics:updated emission
    console.log('\n🧪 Testing expense:created & analytics:updated on createExpense()...');
    const createdEventPromise = new Promise((resolve) => {
      client.once('expense:created', (data) => {
        console.log('✅ Received [expense:created] event:', data.title, `₹${data.amount}`);
        resolve(data);
      });
    });

    const analyticsCreatedPromise = new Promise((resolve) => {
      client.once('analytics:updated', (data) => {
        console.log('✅ Received [analytics:updated] after create, top category:', data.topCategory?.category);
        resolve(data);
      });
    });

    // Invoke createExpense directly simulating controller execution
    const mockReq = {
      body: {
        title: 'Socket Coffee Test',
        amount: 150,
        category: 'Food',
        date: new Date().toISOString(),
      },
      user: testUser,
    };
    let createdExpenseDoc = null;
    const mockRes = {
      status(code) {
        return {
          json(resBody) {
            createdExpenseDoc = resBody.data;
          },
        };
      },
    };

    await createExpense(mockReq, mockRes, (err) => {
      if (err) throw err;
    });

    const [createdData, analyticsData1] = await Promise.all([
      createdEventPromise,
      analyticsCreatedPromise,
    ]);

    if (!createdData || createdData.title !== 'Socket Coffee Test') {
      throw new Error('expense:created payload verification failed');
    }

    // 7. Test expense:updated & analytics:updated emission
    console.log('\n🧪 Testing expense:updated & analytics:updated on updateExpense()...');
    const updatedEventPromise = new Promise((resolve) => {
      client.once('expense:updated', (data) => {
        console.log('✅ Received [expense:updated] event:', data.title, `₹${data.amount}`);
        resolve(data);
      });
    });

    const analyticsUpdatedPromise = new Promise((resolve) => {
      client.once('analytics:updated', (data) => {
        console.log('✅ Received [analytics:updated] after edit, this month total:', data.thisMonthTotal);
        resolve(data);
      });
    });

    const mockUpdateReq = {
      params: { id: createdExpenseDoc._id.toString() },
      body: {
        title: 'Socket Coffee Test (Updated)',
        amount: 250,
      },
      user: testUser,
    };

    await updateExpense(mockUpdateReq, mockRes, (err) => {
      if (err) throw err;
    });

    const [updatedData, analyticsData2] = await Promise.all([
      updatedEventPromise,
      analyticsUpdatedPromise,
    ]);

    if (!updatedData || updatedData.amount !== 250) {
      throw new Error('expense:updated payload verification failed');
    }

    // 8. Test expense:deleted & analytics:updated emission
    console.log('\n🧪 Testing expense:deleted & analytics:updated on deleteExpense()...');
    const deletedEventPromise = new Promise((resolve) => {
      client.once('expense:deleted', (data) => {
        console.log('✅ Received [expense:deleted] event for ID:', data.id);
        resolve(data);
      });
    });

    const analyticsDeletedPromise = new Promise((resolve) => {
      client.once('analytics:updated', (data) => {
        console.log('✅ Received [analytics:updated] after delete, this month total:', data.thisMonthTotal);
        resolve(data);
      });
    });

    const mockDeleteReq = {
      params: { id: createdExpenseDoc._id.toString() },
      user: testUser,
    };

    await deleteExpense(mockDeleteReq, mockRes, (err) => {
      if (err) throw err;
    });

    const [deletedData, analyticsData3] = await Promise.all([
      deletedEventPromise,
      analyticsDeletedPromise,
    ]);

    const targetDeletedId = mockDeleteReq.params.id;
    if (!deletedData || (deletedData.id !== targetDeletedId && deletedData._id !== targetDeletedId)) {
      throw new Error('expense:deleted payload verification failed');
    }

    client.disconnect();
    console.log('\n🎉 ALL REAL-TIME SOCKET.IO TESTS PASSED SUCCESSFULLY!');
  } finally {
    httpServer.close();
    await mongoose.connection.close();
  }
}

runRealtimeSocketTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
