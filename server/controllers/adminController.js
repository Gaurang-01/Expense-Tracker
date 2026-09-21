import User from '../models/User.js';

// @desc    Get all registered users (Admin only)
// @route   GET /api/admin/users
// @access  Private / Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};
