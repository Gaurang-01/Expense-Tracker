import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import Income from '../models/Income.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';
import RecurringExpense from '../models/RecurringExpense.js';
import Investment from '../models/Investment.js';
import Group from '../models/Group.js';
import Notification from '../models/Notification.js';

// ── Category-specific titles and amount ranges ──────────────────────────
const CATEGORY_CONFIG = {
  Food: {
    titles: [
      'Swiggy order', 'Zomato delivery', 'Lunch at cafe', 'Grocery run',
      'Chai break', 'Dinner with friends', 'Dominos pizza', 'Street food',
      'Breakfast at Starbucks', 'Weekly groceries', 'Ice cream parlor',
      'Biriyani order',
    ],
    min: 50,
    max: 600,
    monthlyGrowth: 1.10, // 10% increase month-over-month
    weight: 0.30, // 30% of expenses
  },
  Travel: {
    titles: [
      'Uber to college', 'Metro recharge', 'Weekend trip', 'Ola cab ride',
      'Auto rickshaw', 'Bus pass renewal', 'Fuel station', 'Rapido bike taxi',
      'Train ticket', 'Parking fee',
    ],
    min: 30,
    max: 2000,
    monthlyGrowth: 1.02,
    weight: 0.20,
  },
  Shopping: {
    titles: [
      'Amazon order', 'New shoes', 'Flipkart purchase', 'Myntra haul',
      'Phone accessories', 'Book purchase', 'Stationery supplies',
      'Clothes shopping', 'Home decor item',
    ],
    min: 300,
    max: 5000,
    monthlyGrowth: 1.04,
    weight: 0.15,
  },
  Bills: {
    titles: [
      'Electricity bill', 'Mobile recharge', 'Internet bill', 'Water bill',
      'Gas cylinder', 'Netflix subscription', 'Spotify premium', 'Cloud storage',
      'Gym membership', 'Insurance premium',
    ],
    min: 200,
    max: 1500,
    monthlyGrowth: 1.01,
    weight: 0.18,
  },
  Entertainment: {
    titles: [
      'Movie tickets', 'Concert tickets', 'Bowling night', 'Gaming purchase',
      'Amusement park', 'Board game cafe', 'Stand-up comedy show',
      'Theme park visit', 'Escape room',
    ],
    min: 100,
    max: 800,
    monthlyGrowth: 1.05,
    weight: 0.10,
  },
  Other: {
    titles: [
      'Medical checkup', 'Donation', 'Dry cleaning', 'Pet supplies',
      'Gift for friend', 'Courier charges', 'Miscellaneous',
      'Exam fees', 'Printing charges',
    ],
    min: 50,
    max: 1200,
    monthlyGrowth: 1.00,
    weight: 0.07,
  },
};

// ── Intentional outlier expenses ────────────────────────────────────────
const OUTLIERS = [
  { title: 'Laptop accessory', category: 'Shopping', amount: 15000 },
  { title: 'Flight ticket to Goa', category: 'Travel', amount: 8000 },
  { title: 'Anniversary dinner', category: 'Food', amount: 4500 },
  { title: 'Music festival passes', category: 'Entertainment', amount: 6000 },
  { title: 'Dental treatment', category: 'Other', amount: 7500 },
];

// ── Helpers ─────────────────────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDateInMonth(year, month) {
  // month is 0-indexed
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = rand(1, daysInMonth);

  // Bias toward weekends: 40% chance of forcing Sat/Sun
  let date = new Date(year, month, day);
  if (Math.random() < 0.25) {
    // Shift to nearest Saturday or Sunday
    const dow = date.getDay();
    if (dow === 0 || dow === 6) {
      // already weekend, keep it
    } else {
      // shift to upcoming Saturday
      const daysToSat = 6 - dow;
      const satDay = day + daysToSat;
      if (satDay <= daysInMonth) {
        date = new Date(year, month, satDay);
      }
    }
  }

  // Random hour/minute for variety
  date.setHours(rand(8, 22), rand(0, 59), rand(0, 59));
  return date;
}

// ── Main Seed Function ──────────────────────────────────────────────────
async function seed() {
  await connectDB();

  // Determine target user
  let userId;
  const cliArg = process.argv.find((a) => a.startsWith('--userId='));
  if (cliArg) {
    userId = cliArg.split('=')[1];
  } else {
    // Find first user in DB
    const user = await User.findOne().sort({ createdAt: 1 });
    if (!user) {
      console.error('❌ No users found in the database. Please register a user first.');
      process.exit(1);
    }
    userId = user._id;
    console.log(`📌 Using user: ${user.name} (${user.email})`);
  }

  // Clear existing expenses for this user
  const deleteResult = await Expense.deleteMany({ user: userId });
  console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing expenses for this user.`);

  const expenses = [];
  const now = new Date();
  const categories = Object.keys(CATEGORY_CONFIG);

  // Generate expenses for each of the last 6 months
  for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth(); // 0-indexed

    // Determine how many expenses this month (20-25)
    const countThisMonth = rand(20, 25);

    // Distribute across categories according to weights
    for (let i = 0; i < countThisMonth; i++) {
      // Pick category using weighted random
      const r = Math.random();
      let cumulative = 0;
      let selectedCategory = 'Other';
      for (const cat of categories) {
        cumulative += CATEGORY_CONFIG[cat].weight;
        if (r <= cumulative) {
          selectedCategory = cat;
          break;
        }
      }

      const config = CATEGORY_CONFIG[selectedCategory];

      // Apply monthly growth factor (older months have lower base)
      const growthMultiplier = Math.pow(config.monthlyGrowth, 5 - monthOffset);
      const adjustedMin = Math.round(config.min * growthMultiplier);
      const adjustedMax = Math.round(config.max * growthMultiplier);

      const title = pickRandom(config.titles);
      const amount = randomFloat(adjustedMin, Math.min(adjustedMax, adjustedMin * 4));
      const date = getRandomDateInMonth(year, month);

      // Don't generate future dates
      if (date > now) {
        date.setDate(now.getDate() - rand(1, 5));
        date.setMonth(now.getMonth());
        date.setFullYear(now.getFullYear());
      }

      expenses.push({
        title,
        amount,
        category: selectedCategory,
        date,
        user: userId,
      });
    }
  }

  // ── Insert outliers into recent months ──────────────────────────────
  for (const outlier of OUTLIERS) {
    // Place outliers in the current month or last month
    const monthOffset = Math.random() < 0.7 ? 0 : 1;
    const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const date = getRandomDateInMonth(targetDate.getFullYear(), targetDate.getMonth());
    if (date > now) {
      date.setDate(now.getDate() - rand(1, 3));
      date.setMonth(now.getMonth());
      date.setFullYear(now.getFullYear());
    }

    expenses.push({
      title: outlier.title,
      amount: outlier.amount,
      category: outlier.category,
      date,
      user: userId,
    });
  }

  // ── Bulk insert ────────────────────────────────────────────────────
  const result = await Expense.insertMany(expenses);

  // ── Summary ────────────────────────────────────────────────────────
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const dates = expenses.map((e) => e.date).sort((a, b) => a - b);
  const earliest = dates[0];
  const latest = dates[dates.length - 1];

  // ── Seed Income ──────────────────────────────────────────────────────
  await Income.deleteMany({ user: userId });
  const incomes = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    incomes.push({
      user: userId,
      source: 'Salary',
      amount: 75000,
      date: d,
      description: `Monthly salary credit (${d.toLocaleString('en-IN', { month: 'short' })})`,
    });
    if (m % 2 === 0) {
      const fd = new Date(now.getFullYear(), now.getMonth() - m, 15);
      incomes.push({
        user: userId,
        source: 'Freelance',
        amount: rand(15000, 30000),
        date: fd,
        description: 'Web development milestone payment',
      });
    }
  }
  await Income.insertMany(incomes);
  console.log(`   💵 Seeded ${incomes.length} income transactions`);

  // ── Seed Budgets ─────────────────────────────────────────────────────
  await Budget.deleteMany({ user: userId });
  const sampleBudgets = [
    { category: 'Food', limit: 12000, user: userId },
    { category: 'Travel', limit: 6000, user: userId },
    { category: 'Shopping', limit: 8000, user: userId },
    { category: 'Bills', limit: 10000, user: userId },
    { category: 'Entertainment', limit: 5000, user: userId },
  ];
  await Budget.insertMany(sampleBudgets);
  console.log(`   📊 Seeded ${sampleBudgets.length} category budgets`);

  // ── Seed Goals ───────────────────────────────────────────────────────
  await Goal.deleteMany({ user: userId });
  const sampleGoals = [
    {
      user: userId,
      title: 'Emergency Reserve Fund',
      targetAmount: 150000,
      currentAmount: 85000,
      deadline: new Date(now.getFullYear(), now.getMonth() + 6, 1),
      category: 'Emergency',
    },
    {
      user: userId,
      title: 'MacBook Pro M3',
      targetAmount: 120000,
      currentAmount: 120000,
      deadline: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      category: 'Gadgets',
    },
    {
      user: userId,
      title: 'Trip to Bali',
      targetAmount: 80000,
      currentAmount: 32000,
      deadline: new Date(now.getFullYear(), now.getMonth() + 4, 15),
      category: 'Travel',
    },
  ];
  await Goal.insertMany(sampleGoals);
  console.log(`   🎯 Seeded ${sampleGoals.length} savings goals`);

  // ── Seed Recurring Expenses ──────────────────────────────────────────
  await RecurringExpense.deleteMany({ user: userId });
  const sampleRecurring = [
    {
      user: userId,
      title: 'House Rent',
      amount: 18000,
      category: 'Bills',
      frequency: 'monthly',
      nextDue: new Date(now.getFullYear(), now.getMonth(), 1),
      isActive: true,
    },
    {
      user: userId,
      title: 'Netflix Premium',
      amount: 649,
      category: 'Entertainment',
      frequency: 'monthly',
      nextDue: new Date(now.getFullYear(), now.getMonth(), 18),
      isActive: true,
    },
    {
      user: userId,
      title: 'Gym & Fitness Membership',
      amount: 2500,
      category: 'Health',
      frequency: 'monthly',
      nextDue: new Date(now.getFullYear(), now.getMonth(), 25),
      isActive: true,
    },
    {
      user: userId,
      title: 'Airtel Fiber Broadband',
      amount: 999,
      category: 'Bills',
      frequency: 'monthly',
      nextDue: new Date(now.getFullYear(), now.getMonth(), 10),
      isActive: true,
    },
  ];
  await RecurringExpense.insertMany(sampleRecurring);
  console.log(`   🔄 Seeded ${sampleRecurring.length} recurring expenses`);

  // ── Seed Investments ─────────────────────────────────────────────────
  await Investment.deleteMany({ user: userId });
  const sampleInvestments = [
    {
      user: userId,
      name: 'NIFTY 50 Index Fund',
      type: 'Mutual Fund',
      investedAmount: 50000,
      currentValue: 58400,
      notes: 'Monthly SIP via Zerodha Coin',
    },
    {
      user: userId,
      name: 'Tata Motors',
      type: 'Stock',
      investedAmount: 30000,
      currentValue: 36200,
      notes: 'Long-term equity holding',
    },
    {
      user: userId,
      name: 'Sovereign Gold Bonds (SGB)',
      type: 'Gold',
      investedAmount: 25000,
      currentValue: 27500,
      notes: 'RBI gold tranche',
    },
    {
      user: userId,
      name: 'Ethereum (ETH)',
      type: 'Crypto',
      investedAmount: 15000,
      currentValue: 18900,
      notes: 'Cold storage wallet',
    },
  ];
  await Investment.insertMany(sampleInvestments);
  console.log(`   📈 Seeded ${sampleInvestments.length} investment assets`);

  // ── Seed Groups ──────────────────────────────────────────────────────
  await Group.deleteMany({ createdBy: userId });
  const sampleGroup = await Group.create({
    name: 'Flat 402 Roommates',
    description: 'Shared flat utilities, groceries, and cleaning',
    createdBy: userId,
    members: [userId],
    expenses: [
      {
        description: 'Monthly Wi-Fi & Electricity',
        amount: 2400,
        paidBy: userId,
        category: 'Bills',
        date: new Date(),
        splitType: 'equal',
        splits: [
          { member: userId, amount: 2400, settled: true },
        ],
      },
    ],
  });
  console.log(`   👥 Seeded group: "${sampleGroup.name}"`);

  // ── Seed Notifications ───────────────────────────────────────────────
  await Notification.deleteMany({ user: userId });
  const sampleNotifs = [
    {
      user: userId,
      title: 'Welcome to FinanceFlow!',
      message: 'Your personal finance manager is now equipped with budgets, goals, investments, and live sync.',
      type: 'info',
      read: false,
    },
    {
      user: userId,
      title: 'Budget Alert: Food at 85%',
      message: 'You have spent 85% of your ₹12,000 monthly Food limit.',
      type: 'budget_alert',
      read: false,
    },
    {
      user: userId,
      title: 'Goal Milestone Achieved!',
      message: 'Congratulations! You reached 100% of your MacBook Pro M3 savings target.',
      type: 'goal_reached',
      read: true,
    },
  ];
  await Notification.insertMany(sampleNotifs);
  console.log(`   🔔 Seeded ${sampleNotifs.length} notifications`);

  console.log('\n✅ Comprehensive seed completed successfully!');
  await mongoose.disconnect();
  console.log('🔌 Database disconnected.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
