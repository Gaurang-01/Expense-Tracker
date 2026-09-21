import Expense from '../models/Expense.js';
import mongoose from 'mongoose';

// @desc    Get analytics data for the logged-in user
// @route   GET /api/expenses/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed
    const dayOfMonth = now.getDate();

    // Start of current month
    const thisMonthStart = new Date(currentYear, currentMonth - 1, 1);
    // Start of last month
    const lastMonthStart = new Date(currentYear, currentMonth - 2, 1);
    // Start of 6 months ago
    const sixMonthsAgo = new Date(currentYear, currentMonth - 7, 1);

    // Days in current month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    // ── 1. Monthly Trend (last 6 months) ─────────────────────────────
    const monthlyTrend = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    // ── 2. Category Breakdown (current month) ────────────────────────
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: thisMonthStart },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: { $round: ['$total', 2] },
          count: 1,
        },
      },
    ]);

    // ── 3. Month Comparison (this month vs last month, per category) ─
    const twoMonthData = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: lastMonthStart },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            category: '$category',
          },
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Reshape into { category: { thisMonth, lastMonth, pctChange } }
    const lastMonthNum = lastMonthStart.getMonth() + 1;
    const lastMonthYear = lastMonthStart.getFullYear();
    const categoryMap = {};

    for (const item of twoMonthData) {
      const cat = item._id.category;
      if (!categoryMap[cat]) {
        categoryMap[cat] = { category: cat, thisMonth: 0, lastMonth: 0 };
      }
      if (item._id.year === currentYear && item._id.month === currentMonth) {
        categoryMap[cat].thisMonth = Math.round(item.total * 100) / 100;
      } else if (item._id.year === lastMonthYear && item._id.month === lastMonthNum) {
        categoryMap[cat].lastMonth = Math.round(item.total * 100) / 100;
      }
    }

    const monthComparison = Object.values(categoryMap).map((c) => ({
      ...c,
      pctChange:
        c.lastMonth > 0
          ? Math.round(((c.thisMonth - c.lastMonth) / c.lastMonth) * 100)
          : c.thisMonth > 0
            ? 100
            : 0,
    }));

    // ── 4. Daily Average & Projected Total ───────────────────────────
    const thisMonthTotal = categoryBreakdown.reduce((sum, c) => sum + c.total, 0);
    const dailyAverage = dayOfMonth > 0 ? Math.round((thisMonthTotal / dayOfMonth) * 100) / 100 : 0;
    const projectedTotal = Math.round(dailyAverage * daysInMonth * 100) / 100;

    // ── 5. Top Category ──────────────────────────────────────────────
    const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

    // ── 6. Unusual Expenses ──────────────────────────────────────────
    // Find per-category average this month, then flag expenses > 2× that
    const categoryAverages = {};
    for (const c of categoryBreakdown) {
      categoryAverages[c.category] = c.count > 0 ? c.total / c.count : 0;
    }

    let unusualExpenses = [];
    if (Object.keys(categoryAverages).length > 0) {
      const thisMonthExpenses = await Expense.find({
        user: userId,
        date: { $gte: thisMonthStart },
      }).lean();

      unusualExpenses = thisMonthExpenses
        .filter((e) => {
          const avg = categoryAverages[e.category] || 0;
          return avg > 0 && e.amount > 2 * avg;
        })
        .map((e) => ({
          _id: e._id,
          title: e.title,
          amount: e.amount,
          category: e.category,
          date: e.date,
        }));
    }

    // ── 7. Day of Week Pattern ───────────────────────────────────────
    const dayOfWeekRaw = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$date' }, // 1=Sun, 2=Mon, …, 7=Sat
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Map MongoDB dayOfWeek (1=Sun..7=Sat) to Mon-Sun order
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeekMap = {};
    for (const d of dayOfWeekRaw) {
      const name = dayNames[d._id - 1] || 'Unknown';
      dayOfWeekMap[name] = { day: name, total: Math.round(d.total * 100) / 100, count: d.count };
    }
    // Ensure all 7 days are present, ordered Mon-Sun
    const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayOfWeekPattern = orderedDays.map((d) => dayOfWeekMap[d] || { day: d, total: 0, count: 0 });

    // ── Response ─────────────────────────────────────────────────────
    res.status(200).json({
      success: true,
      data: {
        monthlyTrend,
        categoryBreakdown,
        monthComparison,
        dailyAverage,
        projectedTotal,
        thisMonthTotal: Math.round(thisMonthTotal * 100) / 100,
        topCategory,
        unusualExpenses,
        dayOfWeekPattern,
        meta: {
          currentMonth,
          currentYear,
          dayOfMonth,
          daysInMonth,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
