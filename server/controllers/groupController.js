import Group from '../models/Group.js';
import User from '../models/User.js';
import { getIO } from '../socket.js';

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Emit a socket event to every member of the group
 */
function emitToGroup(groupId, event, payload) {
  try {
    const io = getIO();
    if (io) {
      io.to(`group:${groupId}`).emit(event, payload);
    }
  } catch (err) {
    console.warn('[Group Socket] Emit error:', err.message);
  }
}

/**
 * Compute "who owes whom" balances from group expenses.
 * Returns array of { from, to, amount } settlement pairs.
 */
function computeBalances(group) {
  // net[memberId] = positive means they are owed, negative means they owe
  const net = {};

  for (const member of group.members) {
    net[member._id.toString()] = 0;
  }

  for (const expense of group.expenses) {
    const paidById = expense.paidBy.toString();
    // Payer is credited the full amount
    if (net[paidById] !== undefined) net[paidById] += expense.amount;
    // Each split member is debited their share
    for (const split of expense.splits) {
      const memberId = split.member.toString();
      if (split.settled) {
        if (net[paidById] !== undefined) net[paidById] -= split.amount;
      } else if (net[memberId] !== undefined) {
        net[memberId] -= split.amount;
      }
    }
  }

  // Build settlement list
  const settlements = [];
  const debtors = Object.entries(net)
    .filter(([, v]) => v < 0)
    .map(([id, v]) => ({ id, amount: -v }));
  const creditors = Object.entries(net)
    .filter(([, v]) => v > 0)
    .map(([id, v]) => ({ id, amount: v }));

  // Greedy match
  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const pay = Math.min(debtors[d].amount, creditors[c].amount);
    if (pay > 0.01) {
      settlements.push({ from: debtors[d].id, to: creditors[c].id, amount: Math.round(pay * 100) / 100 });
    }
    debtors[d].amount -= pay;
    creditors[c].amount -= pay;
    if (debtors[d].amount < 0.01) d++;
    if (creditors[c].amount < 0.01) c++;
  }

  return settlements;
}

// @desc    Get all groups for logged-in user
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email')
      .populate('createdBy', 'name email')
      .populate('expenses.paidBy', 'name email')
      .sort({ updatedAt: -1 });

    const enriched = groups.map((g) => {
      const obj = g.toObject();
      obj.balances = computeBalances(g);
      return obj;
    });

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

// @desc    Invite a member by email
// @route   POST /api/groups/:id/invite
// @access  Private
export const inviteMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) {
      const error = new Error('Group not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if user with that email exists
    const invitee = await User.findOne({ email: email.toLowerCase().trim() });
    if (invitee) {
      const alreadyMember = group.members.some((m) => m.toString() === invitee._id.toString());
      if (!alreadyMember) {
        group.members.push(invitee._id);
        // Remove from pending if present
        group.pendingInvites = group.pendingInvites.filter((e) => e !== email.toLowerCase().trim());
        await group.save();
        // Add to socket room
        const io = getIO();
        if (io) {
          const sockets = await io.in(invitee._id.toString()).fetchSockets();
          sockets.forEach((s) => s.join(`group:${group._id}`));
        }
      }
    } else {
      // Store pending invite for when they register
      if (!group.pendingInvites.includes(email.toLowerCase().trim())) {
        group.pendingInvites.push(email.toLowerCase().trim());
        await group.save();
      }
    }

    const populated = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');

    emitToGroup(group._id, 'group:updated', populated);

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a group expense
// @route   POST /api/groups/:id/expenses
// @access  Private
export const addGroupExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, splitType, customSplits } = req.body;

    const group = await Group.findOne({ _id: req.params.id, members: req.user._id })
      .populate('members', 'name email');

    if (!group) {
      const error = new Error('Group not found');
      error.statusCode = 404;
      throw error;
    }

    let splits = [];
    if (splitType === 'custom' && customSplits?.length) {
      const memberIds = new Set(group.members.map((m) => m._id.toString()));
      const uniqueMembers = new Set(customSplits.map((s) => String(s.member)));
      const splitTotal = customSplits.reduce((sum, s) => sum + Number(s.amount || 0), 0);
      if (customSplits.some((s) => !memberIds.has(String(s.member)) || !Number.isFinite(Number(s.amount)) || Number(s.amount) < 0)
        || uniqueMembers.size !== customSplits.length
        || Math.abs(splitTotal - Number(amount)) > 0.01) {
        const error = new Error('Custom splits must assign each group member at most once and total the expense amount');
        error.statusCode = 400;
        throw error;
      }
      splits = customSplits.map((s) => ({ member: s.member, amount: s.amount, settled: false }));
    } else {
      // Equal split among all members
      const cents = Math.round(Number(amount) * 100);
      const shareCents = Math.floor(cents / group.members.length);
      let remainder = cents - shareCents * group.members.length;
      splits = group.members.map((m) => {
        const share = shareCents + (remainder-- > 0 ? 1 : 0);
        return { member: m._id, amount: share / 100, settled: false };
      });
    }

    group.expenses.push({
      title,
      amount,
      category,
      date: date || new Date(),
      paidBy: req.user._id,
      splitType: splitType || 'equal',
      splits,
    });

    await group.save();

    const populated = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('expenses.paidBy', 'name email');
    const obj = populated.toObject();
    obj.balances = computeBalances(populated);

    emitToGroup(group._id, 'group:expense:added', obj);
    emitToGroup(group._id, 'group:updated', obj);

    res.status(201).json({ success: true, data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Settle a split (mark as paid)
// @route   PUT /api/groups/:id/expenses/:expenseId/settle/:memberId
// @access  Private
export const settleSplit = async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, members: req.user._id });
    if (!group) {
      const error = new Error('Group not found');
      error.statusCode = 404;
      throw error;
    }

    const expense = group.expenses.id(req.params.expenseId);
    if (!expense) {
      const error = new Error('Group expense not found');
      error.statusCode = 404;
      throw error;
    }

    const split = expense.splits.find((s) => s.member.toString() === req.params.memberId);
    if (!split) {
      const error = new Error('Split not found');
      error.statusCode = 404;
      throw error;
    }

    split.settled = true;
    await group.save();

    const populated = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('expenses.paidBy', 'name email');
    const obj = populated.toObject();
    obj.balances = computeBalances(populated);

    emitToGroup(group._id, 'group:updated', obj);

    res.status(200).json({ success: true, data: obj });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private (creator only)
export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!group) {
      const error = new Error('Group not found or not authorized');
      error.statusCode = 404;
      throw error;
    }
    await group.deleteOne();
    res.status(200).json({ success: true, data: {}, message: 'Group deleted' });
  } catch (error) {
    next(error);
  }
};
