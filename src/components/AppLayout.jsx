import Header from './Header';
import Navigation from './Navigation';
import Toast from './Toast';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header />
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {children}
      </main>

      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-xs text-gray-400 dark:text-gray-600">
        FinanceFlow · Comprehensive Personal Finance Management & Real-Time Sync
      </footer>

      <Toast />
    </div>
  );
}
