import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { createAndDeliverNotification } from '../utils/notificationHelper.js';

// Helper: calculate spent for a category in a given month/year for a user
async function getSpentForBudget(userId, category, month, year) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const result = await Expense.aggregate([
    { $match: { user: userId, category, date: { $gte: start, $lte: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
}

// @desc    Get all budgets for logged-in user (current month by default)
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month, year });

    // Enrich with spent amounts
    const enriched = await Promise.all(
      budgets.map(async (b) => {
        const spent = await getSpentForBudget(req.user._id, b.category, b.month, b.year);
        return { ...b.toObject(), spent, percentage: Math.round((spent / b.limit) * 100), remaining: b.limit - spent };
      })
    );

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update budget for a category+month
// @route   POST /api/budgets
// @access  Private
export const upsertBudget = async (req, res, next) => {
  try {
    const { category, limit, month, year } = req.body;

    if (!category || !limit || !month || !year) {
      const error = new Error('category, limit, month and year are required');
      error.statusCode = 400;
      throw error;
    }

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month, year },
      { limit },
      { upsert: true, returnDocument: 'after', runValidators: true }
    );

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) {
      const error = new Error('Budget not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: {}, message: 'Budget deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Check all budgets for a user after an expense is created/updated/deleted.
 * Persists and broadcasts notification:new events at 85% and 100%.
 */
export async function checkBudgetAlerts(userId) {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({ user: userId, month, year });

    for (const budget of budgets) {
      const spent = await getSpentForBudget(userId, budget.category, month, year);
      const pct = (spent / budget.limit) * 100;

      if (pct >= 100 && !budget.notified100) {
        await createAndDeliverNotification({
          user: userId,
          title: `🚨 Budget Exceeded: ${budget.category}`,
          message: `You've exceeded your ₹${budget.limit.toLocaleString('en-IN')} budget for ${budget.category} this month (spent ₹${spent.toLocaleString('en-IN')}).`,
          type: 'budget_alert',
          refModel: 'Budget',
          refId: budget._id,
        });
        budget.notified100 = true;
        await budget.save();
      } else if (pct >= 85 && !budget.notified85) {
        await createAndDeliverNotification({
          user: userId,
          title: `⚠️ Budget Warning: ${budget.category}`,
          message: `You've used ${Math.round(pct)}% of your ₹${budget.limit.toLocaleString('en-IN')} budget for ${budget.category} this month.`,
          type: 'budget_alert',
          refModel: 'Budget',
          refId: budget._id,
        });
        budget.notified85 = true;
        await budget.save();
      }
    }
  } catch (err) {
    console.error('[BudgetAlert] Error:', err.message);
  }
}
