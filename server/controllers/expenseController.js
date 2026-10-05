import Expense from '../models/Expense.js';
import { getIO } from '../socket.js';
import { emitAnalyticsUpdated } from './analyticsController.js';

// @desc    Get all expenses for logged in user (with optional filtering)
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res, next) => {
  try {
    const filter = {
      user: req.user._id,
    };

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Date range filter
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) {
        filter.date.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        // Include the entire day
        const dateTo = new Date(req.query.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        filter.date.$lte = dateTo;
      }
    }

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID (scoped to user)
// @route   GET /api/expenses/:id
// @access  Private
export const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      const error = new Error('Expense not found');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense (scoped to logged in user)
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create({
      ...req.body,
      user: req.user._id,
    });

    // Real-time broadcast to user's personal room
    try {
      const io = getIO();
      if (io) {
        io.to(req.user._id.toString()).emit('expense:created', expense);
      }
      // Recompute and emit updated analytics
      emitAnalyticsUpdated(req.user._id);
    } catch (socketErr) {
      console.warn('[Socket.IO] Emit expense:created error:', socketErr.message);
    }

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense (scoped to logged in user)
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    );

    if (!expense) {
      const error = new Error('Expense not found');
      error.statusCode = 404;
      throw error;
    }

    // Real-time broadcast to user's personal room
    try {
      const io = getIO();
      if (io) {
        io.to(req.user._id.toString()).emit('expense:updated', expense);
      }
      // Recompute and emit updated analytics
      emitAnalyticsUpdated(req.user._id);
    } catch (socketErr) {
      console.warn('[Socket.IO] Emit expense:updated error:', socketErr.message);
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense (scoped to logged in user)
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      const error = new Error('Expense not found');
      error.statusCode = 404;
      throw error;
    }

    // Real-time broadcast to user's personal room
    try {
      const io = getIO();
      if (io) {
        io.to(req.user._id.toString()).emit('expense:deleted', {
          id: req.params.id,
          _id: req.params.id,
        });
      }
      // Recompute and emit updated analytics
      emitAnalyticsUpdated(req.user._id);
    } catch (socketErr) {
      console.warn('[Socket.IO] Emit expense:deleted error:', socketErr.message);
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
