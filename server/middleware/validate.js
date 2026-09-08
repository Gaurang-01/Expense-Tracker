import { body, validationResult } from 'express-validator';

// ── Validation rules for expense POST/PUT ─────────────────────────────
export const validateExpense = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .escape(),

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'])
    .withMessage('Invalid category'),

  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be a valid date')
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (inputDate > today) {
        throw new Error('Date cannot be in the future');
      }
      return true;
    }),

  // ── Middleware that checks results ───────────────────────────────────
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }
    next();
  },
];
