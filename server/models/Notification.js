import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
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
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['budget_alert', 'goal_milestone', 'recurring_processed', 'unusual_expense', 'info'],
        message: '{VALUE} is not a valid notification type',
      },
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Optional link to related document
    refModel: {
      type: String,
      enum: ['Budget', 'Goal', 'RecurringExpense', 'Expense', null],
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

// Index for fast unread count queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
