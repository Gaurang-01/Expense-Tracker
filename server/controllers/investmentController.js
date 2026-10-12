import Investment from '../models/Investment.js';

// @desc    Get all investments for logged-in user
// @route   GET /api/investments
// @access  Private
export const getInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Compute portfolio summary
    const totalInvested = investments.reduce((s, i) => s + i.investedAmount, 0);
    const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);
    const totalGainLoss = totalCurrent - totalInvested;
    const gainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    // Allocation by type
    const allocationTotals = {};
    for (const inv of investments) {
      allocationTotals[inv.type] = (allocationTotals[inv.type] || 0) + inv.currentValue;
    }
    const allocation = Object.entries(allocationTotals).map(([type, currentValue]) => ({
      type,
      currentValue,
      percentage: totalCurrent > 0 ? Math.round((currentValue / totalCurrent) * 1000) / 10 : 0,
    }));

    res.status(200).json({
      success: true,
      count: investments.length,
      summary: { totalInvested, totalCurrent, totalGainLoss, percentageGainLoss: gainLossPercent, allocation },
      allocation,
      data: investments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create an investment
// @route   POST /api/investments
// @access  Private
export const createInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an investment (e.g., update currentValue)
// @route   PUT /api/investments/:id
// @access  Private
export const updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!investment) {
      const error = new Error('Investment not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: investment });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an investment
// @route   DELETE /api/investments/:id
// @access  Private
export const deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!investment) {
      const error = new Error('Investment not found');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, data: {}, message: 'Investment deleted' });
  } catch (error) {
    next(error);
  }
};
