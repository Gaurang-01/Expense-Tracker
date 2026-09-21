import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';

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

  console.log('\n✅ Seed completed successfully!');
  console.log(`   📊 Total expenses created: ${result.length}`);
  console.log(`   💰 Total amount: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  console.log(`   📅 Date range: ${earliest.toLocaleDateString('en-IN')} → ${latest.toLocaleDateString('en-IN')}`);
  console.log(`   ⚠️  Outlier expenses: ${OUTLIERS.length}`);

  // Category breakdown
  const catCounts = {};
  for (const e of expenses) {
    catCounts[e.category] = (catCounts[e.category] || 0) + 1;
  }
  console.log('   📁 Category distribution:');
  for (const [cat, count] of Object.entries(catCounts)) {
    console.log(`      • ${cat}: ${count} expenses`);
  }

  await mongoose.disconnect();
  console.log('\n🔌 Database disconnected.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
