import RecurringExpense from '../models/RecurringExpense.js';

// @desc    Get all recurring expenses for logged-in user
// @route   GET /api/recurring
// @access  Private
export const getRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.find({ user: req.user._id }).sort({ nextDue: 1 });
    res.status(200).json({ success: true, count: recurring.length, data: recurring });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a recurring expense
// @route   POST /api/recurring
// @access  Private
export const createRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: recurring });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a recurring expense
// @route   PUT /api/recurring/:id
// @access  Private
export const updateRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!recurring) {
      const error = new Error('Recurring expense not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: recurring });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a recurring expense
// @route   DELETE /api/recurring/:id
// @access  Private
export const deleteRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!recurring) {
      const error = new Error('Recurring expense not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: {}, message: 'Recurring expense deleted' });
  } catch (error) {
    next(error);
  }
};
