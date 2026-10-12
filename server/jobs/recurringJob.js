import cron from 'node-cron';
import RecurringExpense from '../models/RecurringExpense.js';
import Expense from '../models/Expense.js';
import { createAndDeliverNotification } from '../utils/notificationHelper.js';
import { getIO } from '../socket.js';
import { emitAnalyticsUpdated } from '../controllers/analyticsController.js';
import { checkBudgetAlerts } from '../controllers/budgetController.js';

/**
 * Process all due recurring expenses:
 * - Create an actual Expense document
 * - Advance nextDue by the frequency interval
 * - Emit socket events and notifications
 */
async function processRecurringExpenses() {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // treat "today" as the boundary

  try {
    const due = await RecurringExpense.find({ isActive: true, nextDue: { $lte: now } });

    if (due.length === 0) return;

    console.log(`[Cron] Processing ${due.length} recurring expense(s)...`);

    for (const r of due) {
      try {
        // Create the actual expense
        const expense = await Expense.create({
          title: r.title,
          amount: r.amount,
          category: r.category,
          date: r.nextDue,
          user: r.user,
        });
        await checkBudgetAlerts(r.user);

        // Advance nextDue
        const next = new Date(r.nextDue);
        if (r.frequency === 'weekly') {
          next.setDate(next.getDate() + 7);
        } else {
          next.setMonth(next.getMonth() + 1);
        }
        r.nextDue = next;
        await r.save();

        // Emit the new expense via socket
        try {
          const io = getIO();
          if (io) {
            io.to(r.user.toString()).emit('expense:created', expense);
            io.to(r.user.toString()).emit('recurring:processed', { recurring: r, expense, nextDue: next });
          }
          emitAnalyticsUpdated(r.user);
        } catch (socketErr) {
          console.warn('[Cron Socket] Emit error:', socketErr.message);
        }

        // Notification
        await createAndDeliverNotification({
          user: r.user,
          title: `🔁 Recurring: ${r.title}`,
          message: `Your recurring ${r.frequency} expense "${r.title}" of ₹${r.amount.toLocaleString('en-IN')} has been processed. Next due: ${next.toLocaleDateString('en-IN')}.`,
          type: 'recurring_processed',
          refModel: 'RecurringExpense',
          refId: r._id,
        });

        console.log(`[Cron] ✅ Processed: ${r.title} for user ${r.user}`);
      } catch (itemErr) {
        console.error(`[Cron] ❌ Failed to process recurring ${r._id}:`, itemErr.message);
      }
    }
  } catch (err) {
    console.error('[Cron] Fatal error in recurring job:', err.message);
  }
}

/**
 * Initialize the recurring expense cron job.
 * Runs every day at 00:05 server time.
 */
export function initRecurringJob() {
  // Run at 00:05 every day
  cron.schedule('5 0 * * *', () => {
    console.log('[Cron] Running recurring expense job...');
    processRecurringExpenses();
  });

  console.log('[Cron] Recurring expense job scheduled (daily at 00:05)');
}
