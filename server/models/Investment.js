import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['Stock', 'Stocks', 'Mutual Fund', 'Mutual Funds', 'Crypto', 'Bond', 'Fixed Deposit', 'Gold', 'Real Estate', 'Other'],
        message: '{VALUE} is not a valid investment type',
      },
    },
    // Amount originally invested
    investedAmount: {
      type: Number,
      required: [true, 'Invested amount is required'],
      min: [0, 'Invested amount cannot be negative'],
    },
    // Manually updated current market value
    currentValue: {
      type: Number,
      required: [true, 'Current value is required'],
      min: [0, 'Current value cannot be negative'],
    },
    purchaseDate: {
      type: Date,
      required: [true, 'Purchase date is required'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: gain/loss
investmentSchema.virtual('gainLoss').get(function () {
  return this.currentValue - this.investedAmount;
});

// Virtual: gain/loss percentage
investmentSchema.virtual('gainLossPercent').get(function () {
  if (this.investedAmount === 0) return 0;
  return ((this.currentValue - this.investedAmount) / this.investedAmount) * 100;
});

const Investment = mongoose.model('Investment', investmentSchema);
export default Investment;
