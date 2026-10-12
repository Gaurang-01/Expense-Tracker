import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be a positive number'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'],
        message: '{VALUE} is not a valid income category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
  },
  { timestamps: true }
);

const Income = mongoose.model('Income', incomeSchema);
export default Income;
