import Goal from '../models/Goal.js';
import { createAndDeliverNotification } from '../utils/notificationHelper.js';

// @desc    Get all goals for logged-in user
// @route   GET /api/goals
// @access  Private
export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ deadline: 1 });
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a savings goal
// @route   POST /api/goals
// @access  Private
export const createGoal = async (req, res, next) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal (title, target, deadline, note)
// @route   PUT /api/goals/:id
// @access  Private
export const updateGoal = async (req, res, next) => {
  try {
    // Don't allow overwriting currentAmount via this route
    const { currentAmount, ...allowed } = req.body;

    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      allowed,
      { returnDocument: 'after', runValidators: true }
    );
    if (!goal) {
      const error = new Error('Goal not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Contribute to a goal
// @route   POST /api/goals/:id/contribute
// @access  Private
export const contributeToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      const error = new Error('Amount must be a positive number');
      error.statusCode = 400;
      throw error;
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      const error = new Error('Goal not found');
      error.statusCode = 404;
      throw error;
    }

    goal.currentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
    const progress = (goal.currentAmount / goal.targetAmount) * 100;

    // Milestone: 50%
    if (progress >= 50 && !goal.notified50) {
      goal.notified50 = true;
      await createAndDeliverNotification({
        user: req.user._id,
        title: `🎯 Halfway There: ${goal.title}`,
        message: `You've reached 50% of your savings goal "${goal.title}" (₹${goal.currentAmount.toLocaleString('en-IN')} / ₹${goal.targetAmount.toLocaleString('en-IN')}).`,
        type: 'goal_milestone',
        refModel: 'Goal',
        refId: goal._id,
      });
    }

    // Milestone: 100%
    if (progress >= 100 && !goal.notified100) {
      goal.notified100 = true;
      await createAndDeliverNotification({
        user: req.user._id,
        title: `🏆 Goal Achieved: ${goal.title}`,
        message: `Congratulations! You've fully funded your savings goal "${goal.title}" (₹${goal.targetAmount.toLocaleString('en-IN')}).`,
        type: 'goal_milestone',
        refModel: 'Goal',
        refId: goal._id,
      });
    }

    await goal.save();
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      const error = new Error('Goal not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: {}, message: 'Goal deleted successfully' });
  } catch (error) {
    next(error);
  }
};
