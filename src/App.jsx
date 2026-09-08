import { useSelector } from 'react-redux';
import { selectDarkMode } from './store/selectors';
import Header from './components/Header';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import Filters from './components/Filters';
import Toast from './components/Toast';

export default function App() {
  const darkMode = useSelector(selectDarkMode);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300${darkMode ? '' : ''}`}>
      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Form */}
        <ExpenseForm />

        {/* Layout: Filters + Summary sidebar on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Filters />
            <ExpenseList />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <Summary />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Expense Tracker · Data stored locally in your browser
        </p>
      </footer>

      {/* Toasts */}
      <Toast />
    </div>
  );
}
