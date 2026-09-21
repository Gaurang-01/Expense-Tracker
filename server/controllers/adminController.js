import User from '../models/User.js';
import Expense from '../models/Expense.js';

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

// @desc    Create a new user (Admin only)
// @route   POST /api/admin/users
// @access  Private / Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user and their expenses (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private / Admin
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Delete user and their associated expenses
    await Expense.deleteMany({ user: id });
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `User ${user.email} and all associated records deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

