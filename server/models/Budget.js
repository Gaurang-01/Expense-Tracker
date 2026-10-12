import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'],
        message: '{VALUE} is not a valid category',
      },
    },
    // Monthly spending limit in INR
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Limit must be at least 1'],
    },
    // Month this budget applies to (1=Jan…12=Dec)
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    // Track whether 85% and 100% alert notifications have been sent this month
    notified85: { type: Boolean, default: false },
    notified100: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One budget per category per month per user
budgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
