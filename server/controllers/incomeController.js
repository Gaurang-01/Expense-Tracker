import Income from '../models/Income.js';

// @desc    Get all income entries for logged-in user
// @route   GET /api/income
// @access  Private
export const getIncomes = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };

    if (req.query.category) filter.category = req.query.category;

    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) filter.date.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo) {
        const dateTo = new Date(req.query.dateTo);
        dateTo.setHours(23, 59, 59, 999);
        filter.date.$lte = dateTo;
      }
    }

    const incomes = await Income.find(filter).sort({ date: -1, createdAt: -1 });

    res.status(200).json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single income
// @route   GET /api/income/:id
// @access  Private
export const getIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, user: req.user._id });
    if (!income) {
      const error = new Error('Income not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Create income
// @route   POST /api/income
// @access  Private
export const createIncome = async (req, res, next) => {
  try {
    const income = await Income.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
export const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!income) {
      const error = new Error('Income not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: income });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
export const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!income) {
      const error = new Error('Income not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: {}, message: 'Income deleted successfully' });
  } catch (error) {
    next(error);
  }
};
