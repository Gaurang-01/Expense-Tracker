import mongoose from 'mongoose';

const recurringExpenseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Other'],
        message: '{VALUE} is not a valid category',
      },
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      enum: {
        values: ['weekly', 'monthly'],
        message: 'Frequency must be weekly or monthly',
      },
    },
    // The next date this expense should be auto-created
    nextDue: {
      type: Date,
      required: [true, 'Next due date is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const RecurringExpense = mongoose.model('RecurringExpense', recurringExpenseSchema);
export default RecurringExpense;
