import { useEffect, useState } from 'react';

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), 2700);
    const removeTimer = setTimeout(() => onRemove(toast.id), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  const colors = {
    success: 'bg-emerald-500 text-white',
    error: 'bg-rose-500 text-white',
    info: 'bg-indigo-500 text-white',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-sm ${
        colors[toast.type] || colors.info
      } ${exiting ? 'animate-slide-out' : 'animate-slide-in'}`}
    >
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
        {icons[toast.type] || icons.info}
      </span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(() => onRemove(toast.id), 300);
        }}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
