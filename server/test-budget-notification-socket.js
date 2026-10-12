import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { io as ClientIO } from 'socket.io-client';
import { initSocket } from './socket.js';
import { createExpense } from './controllers/expenseController.js';
import User from './models/User.js';
import Budget from './models/Budget.js';
import Expense from './models/Expense.js';
import Notification from './models/Notification.js';

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let user;
let client;
let httpServer;

function waitForEvent(socket, eventName) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${eventName}`)), 8000);
    socket.once(eventName, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

async function addTestExpense(amount, title) {
  let result;
  await createExpense({
    body: { title, amount, category: 'Food', date: new Date() },
    user,
  }, {
    status() {
      return { json(body) { result = body; } };
    },
  }, (error) => {
    if (error) throw error;
  });
  return result?.data;
}

async function run() {
  await mongoose.connect(mongoUri);
  user = await User.create({
    name: 'Budget Socket Test',
    email: `budget-socket-${suffix}@example.com`,
    password: 'password123',
    role: 'user',
  });

  httpServer = http.createServer();
  initSocket(httpServer, { origin: '*', methods: ['GET', 'POST'] });
  await new Promise((resolve) => httpServer.listen(0, resolve));

  const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  client = ClientIO(`http://localhost:${httpServer.address().port}`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: false,
  });
  await new Promise((resolve, reject) => {
    client.once('connect', resolve);
    client.once('connect_error', reject);
  });

  const now = new Date();
  const budget = await Budget.create({
    user: user._id,
    category: 'Food',
    limit: 1000,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });

  const warningEvent = waitForEvent(client, 'notification:new');
  const warningAnalyticsEvent = waitForEvent(client, 'analytics:updated');
  await addTestExpense(850, 'Budget socket 85 percent test');
  const [warning] = await Promise.all([warningEvent, warningAnalyticsEvent]);
  if (warning.type !== 'budget_alert' || !warning.message.includes('85%')) {
    throw new Error(`Expected persisted 85% budget notification over Socket.IO; received ${warning.type}: ${warning.title}`);
  }
  if (!(await Notification.exists({ _id: warning._id, user: user._id, type: 'budget_alert' }))) {
    throw new Error('The 85% Socket.IO notification was not persisted');
  }
  console.log('✅ 85% budget threshold persisted and delivered as notification:new');

  const exceededEvent = waitForEvent(client, 'notification:new');
  const exceededAnalyticsEvent = waitForEvent(client, 'analytics:updated');
  await addTestExpense(200, 'Budget socket over-limit test');
  const [exceeded] = await Promise.all([exceededEvent, exceededAnalyticsEvent]);
  if (exceeded.type !== 'budget_alert' || !exceeded.title.includes('Exceeded')) {
    throw new Error(`Expected persisted 100% budget notification over Socket.IO; received ${exceeded.type}: ${exceeded.title}`);
  }
  if (!(await Notification.exists({ _id: exceeded._id, user: user._id, type: 'budget_alert' }))) {
    throw new Error('The 100% Socket.IO notification was not persisted');
  }
  console.log('✅ 100% budget threshold persisted and delivered as notification:new');
}

try {
  await run();
  console.log('🎉 Budget Socket.IO notification test passed');
} catch (error) {
  console.error('❌ Budget Socket.IO notification test failed:', error.message);
  process.exitCode = 1;
} finally {
  client?.disconnect();
  if (user) {
    await Promise.all([
      Budget.deleteMany({ user: user._id }),
      Expense.deleteMany({ user: user._id }),
      Notification.deleteMany({ user: user._id }),
      User.deleteOne({ _id: user._id }),
    ]).catch((error) => console.error('Test cleanup failed:', error.message));
  }
  if (httpServer?.listening) await new Promise((resolve) => httpServer.close(resolve));
  await mongoose.disconnect();
}
