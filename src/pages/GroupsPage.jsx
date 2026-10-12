import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectGroupItems, selectGroupsLoading, selectUser } from '../store/selectors';
import {
  fetchGroups,
  createGroup,
  inviteGroupMember,
  addGroupExpense,
  settleGroupSplit,
  deleteGroup,
} from '../store/slices/groupsSlice';
import { addToast } from '../store/slices/uiSlice';
import { socket } from '../lib/socket';
import { CATEGORIES } from '../utils/categories';
import AppLayout from '../components/AppLayout';

export default function GroupsPage() {
  const dispatch = useDispatch();
  const groups = useSelector(selectGroupItems);
  const loading = useSelector(selectGroupsLoading);
  const currentUser = useSelector(selectUser);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreateGroupModal, setIsCreateGroupModal] = useState(false);
  const [isExpenseModal, setIsExpenseModal] = useState(false);
  const [isInviteModal, setIsInviteModal] = useState(false);

  // Forms state
  const [groupFormData, setGroupFormData] = useState({ name: '', description: '', memberEmails: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    splitType: 'equal',
  });

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  // Keep selectedGroup state synchronized with updated groups
  useEffect(() => {
    if (groups.length > 0) {
      if (!selectedGroup) {
        setSelectedGroup(groups[0]);
      } else {
        const updated = groups.find((g) => g._id === selectedGroup._id);
        if (updated) setSelectedGroup(updated);
      }
    } else {
      setSelectedGroup(null);
    }
  }, [groups]);

  // Join group socket room
  useEffect(() => {
    if (selectedGroup?._id) {
      socket.emit('group:join', selectedGroup._id);
      return () => {
        socket.emit('group:leave', selectedGroup._id);
      };
    }
  }, [selectedGroup?._id]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupFormData.name) {
      dispatch(addToast('Please enter a group name', 'warning'));
      return;
    }

    try {
      const emails = groupFormData.memberEmails
        ? groupFormData.memberEmails.split(',').map((e) => e.trim()).filter(Boolean)
        : [];
      const newGroup = await dispatch(
        createGroup({
          name: groupFormData.name,
          description: groupFormData.description,
          memberEmails: emails,
        })
      ).unwrap();
      dispatch(addToast(`Group "${newGroup.name}" created!`, 'success'));
      setIsCreateGroupModal(false);
      setGroupFormData({ name: '', description: '', memberEmails: '' });
      setSelectedGroup(newGroup);
    } catch (err) {
      dispatch(addToast(err || 'Failed to create group', 'error'));
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      await dispatch(
        inviteGroupMember({ groupId: selectedGroup._id, email: inviteEmail })
      ).unwrap();
      dispatch(addToast(`Invite sent to ${inviteEmail}`, 'success'));
      setInviteEmail('');
      setIsInviteModal(false);
    } catch (err) {
      dispatch(addToast(err || 'Failed to invite member', 'error'));
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseFormData.description || Number(expenseFormData.amount) <= 0) {
      dispatch(addToast('Please provide description and valid amount', 'warning'));
      return;
    }

    try {
      await dispatch(
        addGroupExpense({
          groupId: selectedGroup._id,
          description: expenseFormData.description,
          amount: Number(expenseFormData.amount),
          category: expenseFormData.category,
          splitType: expenseFormData.splitType,
        })
      ).unwrap();
      dispatch(addToast('Shared expense logged and split evenly!', 'success'));
      setIsExpenseModal(false);
      setExpenseFormData({ description: '', amount: '', category: 'Food', splitType: 'equal' });
    } catch (err) {
      dispatch(addToast(err || 'Failed to add group expense', 'error'));
    }
  };

  const handleSettleSplit = async (expenseId, memberId) => {
    try {
      await dispatch(
        settleGroupSplit({
          groupId: selectedGroup._id,
          expenseId,
          memberId,
        })
      ).unwrap();
      dispatch(addToast('Payment marked as settled!', 'success'));
    } catch (err) {
      dispatch(addToast(err || 'Failed to settle debt', 'error'));
    }
  };

  const handleDeleteGroup = async (id, name) => {
    if (window.confirm(`Delete group "${name}"? All shared expenses will be removed.`)) {
      try {
        await dispatch(deleteGroup(id)).unwrap();
        dispatch(addToast(`Group "${name}" deleted`, 'info'));
        setSelectedGroup(null);
      } catch (err) {
        dispatch(addToast(err || 'Failed to delete group', 'error'));
      }
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Family & Shared Groups
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Split dinners, roommates rent, and family trips with automated debt settlement
          </p>
        </div>
        <button
          onClick={() => setIsCreateGroupModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
        >
          <span>＋</span> Create Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <span className="text-4xl block mb-2">👥</span>
          <p className="font-semibold text-gray-700 dark:text-gray-300">No shared groups yet</p>
          <p className="text-xs text-gray-400 mt-1">Create a group and invite your family, friends, or roommates.</p>
          <button
            onClick={() => setIsCreateGroupModal(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Groups Sidebar Selector */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-1">
              Your Groups ({groups.length})
            </h3>
            <div className="space-y-2">
              {groups.map((g) => {
                const isSelected = selectedGroup?._id === g._id;
                return (
                  <button
                    key={g._id}
                    onClick={() => setSelectedGroup(g)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm truncate">{g.name}</p>
                      <p className={`text-[11px] ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>
                        {g.members?.length || 1} members
                      </p>
                    </div>
                    <span className="text-lg">➔</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Group Details */}
          {selectedGroup && (
            <div className="lg:col-span-3 space-y-6">
              {/* Group Header Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">
                      {selectedGroup.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      Live Room
                    </span>
                  </div>
                  {selectedGroup.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {selectedGroup.description}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400 mt-1">
                    Members: {selectedGroup.members?.map((m) => m.name || m.email).join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsInviteModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors"
                  >
                    ＋ Invite Member
                  </button>
                  <button
                    onClick={() => setIsExpenseModal(true)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                  >
                    ＋ Add Shared Expense
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(selectedGroup._id, selectedGroup.name)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Delete group"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Debt Balances Widget (Who owes whom) */}
              {selectedGroup.debts && selectedGroup.debts.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30">
                  <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider mb-2">
                    ⚖️ Outstanding Debts & Settlements
                  </h4>
                  <div className="space-y-2">
                    {selectedGroup.debts.map((debt, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-800/80 border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-gray-900 dark:text-white">{debt.fromName}</strong> owes{' '}
                          <strong className="text-gray-900 dark:text-white">{debt.toName}</strong>
                        </div>
                        <div className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                          ₹{Number(debt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Group Shared Expenses History */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">Shared Expense History</h4>
                  <span className="text-xs text-gray-400">
                    {selectedGroup.expenses?.length || 0} expenses logged
                  </span>
                </div>

                {!selectedGroup.expenses || selectedGroup.expenses.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <p className="font-semibold text-gray-700 dark:text-gray-300">No expenses recorded yet</p>
                    <p className="text-xs mt-1">Split lunch, dinner, or groceries by adding an expense.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {selectedGroup.expenses.map((exp) => (
                      <div key={exp._id} className="p-4 sm:p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
                              {exp.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Paid by: <span className="font-semibold text-gray-700 dark:text-gray-300">{exp.paidBy?.name || 'Member'}</span> · {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <span className="font-black text-base sm:text-lg text-gray-900 dark:text-white tabular-nums">
                            ₹{Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Splits breakdown */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                          {exp.splits?.map((split, sIdx) => {
                            const isPaidByMe = exp.paidBy?._id === currentUser?._id;
                            const isMySplit = split.member?._id === currentUser?._id;

                            return (
                              <div
                                key={sIdx}
                                className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-2 ${
                                  split.settled
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <span>{split.member?.name || 'Member'}: ₹{Number(split.amount).toFixed(0)}</span>
                                {split.settled ? (
                                  <span className="text-[10px] font-bold text-emerald-600">✓ Settled</span>
                                ) : (
                                  (isPaidByMe || isMySplit) && (
                                    <button
                                      onClick={() => handleSettleSplit(exp._id, split.member?._id)}
                                      className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                    >
                                      Settle
                                    </button>
                                  )
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Group Modal */}
      {isCreateGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Family / Shared Group</h3>
              <button onClick={() => setIsCreateGroupModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roommates 402, Sharma Family, Trip to Manali"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Shared expenses for flat utilities and groceries"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Initial Member Emails (comma-separated)</label>
                <input
                  type="text"
                  placeholder="user1@example.com, user2@example.com"
                  value={groupFormData.memberEmails}
                  onChange={(e) => setGroupFormData({ ...groupFormData, memberEmails: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsCreateGroupModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Invite to {selectedGroup.name}</h3>
              <button onClick={() => setIsInviteModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Registered User Email</label>
                <input
                  type="email"
                  required
                  placeholder="friend@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsInviteModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shared Expense Modal */}
      {isExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Expense to {selectedGroup.name}</h3>
              <button onClick={() => setIsExpenseModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner at Barbeque Nation, Wi-Fi Bill"
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 1800"
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-1">Category</label>
                <select
                  value={expenseFormData.category}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-600 dark:text-gray-400">
                Split automatically among all {selectedGroup.members?.length || 1} members evenly.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsExpenseModal(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md">Add & Split Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
