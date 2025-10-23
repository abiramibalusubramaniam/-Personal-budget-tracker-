import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, Reminder } from './types';
import { ExpensePieChart, WeeklySummaryBarChart } from './components/Charts';
import TransactionModal from './components/TransactionModal';
import ReminderModal from './components/ReminderModal';
import { PencilIcon, PlusIcon, TrashIcon, XMarkIcon, UserIcon, LockClosedIcon, ChevronLeftIcon, ChevronRightIcon } from './components/icons';

type Tab = 'dashboard' | 'transactions' | 'reminders';

interface User {
    username: string;
}

// Custom hook for using localStorage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue];
};


// --- AUTHENTICATION HOOK & COMPONENTS ---

const useAuth = () => {
    const [users, setUsers] = useLocalStorage<{ [username: string]: string }>('budget_tracker_users', {});
    const [currentUsername, setCurrentUsername] = useLocalStorage<string | null>('budget_tracker_currentUser', null);

    const signup = (username: string, password: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (!username || !password) {
                 reject(new Error('Username and password are required.'));
                 return;
            }
            if (users[username]) {
                reject(new Error('User already exists. Please choose a different username.'));
                return;
            }
            setUsers(prev => ({ ...prev, [username]: password }));
            setCurrentUsername(username);
            resolve();
        });
    };

    const login = (username: string, password: string): Promise<void> => {
        return new Promise((resolve, reject) => {
             if (!users[username] || users[username] !== password) {
                reject(new Error('Invalid username or password.'));
                return;
            }
            setCurrentUsername(username);
            resolve();
        });
    };
    
    const logout = () => {
        setCurrentUsername(null);
    };

    const user = currentUsername ? { username: currentUsername } : null;

    return { user, signup, login, logout };
};

const AuthPage: React.FC<{ onLogin: (u: string, p: string) => Promise<void>; onSignup: (u: string, p: string) => Promise<void> }> = ({ onLogin, onSignup }) => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLoginView) {
                await onLogin(username, password);
            } else {
                await onSignup(username, password);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 bg-gradient-to-br from-blue-50 via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/20 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-blue-500/10 dark:shadow-black/50">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {isLoginView ? 'Welcome Back' : 'Create Your Account'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {isLoginView ? 'Sign in to manage your finances.' : 'Get started with your personal budget.'}
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                     <div>
                        <label htmlFor="username-address" className="sr-only">Username</label>
                        <div className="relative">
                           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <UserIcon className="h-5 w-5 text-slate-400"/>
                           </div>
                            <input
                                id="username-address"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Username"
                            />
                        </div>
                    </div>
                    <div>
                         <label htmlFor="password" className="sr-only">Password</label>
                         <div className="relative">
                           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <LockClosedIcon className="h-5 w-5 text-slate-400"/>
                           </div>
                           <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="block w-full rounded-md border-0 py-2.5 pl-10 text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/50 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 transition-colors">
                            {loading ? 'Processing...' : (isLoginView ? 'Sign in' : 'Create Account')}
                        </button>
                    </div>

                     <div className="text-sm text-center">
                        <button type="button" onClick={() => {setIsLoginView(!isLoginView); setError('')}} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                            {isLoginView ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const { user, login, signup, logout } = useAuth();

    if (!user) {
        return <AuthPage onLogin={login} onSignup={signup} />;
    }
    
    return <BudgetTrackerApp user={user} onLogout={logout} />;
};


// --- MAIN BUDGET TRACKER APPLICATION ---

const BudgetTrackerApp: React.FC<{ user: User, onLogout: () => void }> = ({ user, onLogout }) => {
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>(`transactions_${user.username}`, []);
    const [reminders, setReminders] = useLocalStorage<Reminder[]>(`reminders_${user.username}`, []);
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [viewDate, setViewDate] = useState(new Date());

    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    const [isReminderModalOpen, setReminderModalOpen] = useState(false);
    const [reminderToEdit, setReminderToEdit] = useState<Reminder | null>(null);
    
    const [activeNotifications, setActiveNotifications] = useState<Reminder[]>([]);

    const audioContext = useMemo(() => {
        if (typeof window !== 'undefined') {
            return new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return null;
    }, []);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getFullYear() === viewDate.getFullYear() && tDate.getMonth() === viewDate.getMonth();
        });
    }, [transactions, viewDate]);

    const filteredReminders = useMemo(() => {
        return reminders.filter(r => {
            const rDate = new Date(r.dueDate);
            return rDate.getFullYear() === viewDate.getFullYear() && rDate.getMonth() === viewDate.getMonth();
        });
    }, [reminders, viewDate]);

    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    const playNotificationSound = useCallback((sound: Reminder['notificationSound']) => {
        if (!audioContext) return;

        const play = (freq: number, duration: number) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        };

        switch (sound) {
            case 'beep':
                play(880, 0.2);
                break;
            case 'chime':
                play(1046.5, 0.15);
                setTimeout(() => play(1396.9, 0.15), 150);
                break;
            case 'vibrate':
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                break;
            default:
                break;
        }
    }, [audioContext]);

    const checkReminders = useCallback(() => {
        const now = new Date();
        const dueReminders: Reminder[] = [];
        
        const updatedReminders = reminders.map(r => {
            const dueDate = new Date(`${r.dueDate}T${r.dueTime}`);
            const isDue = dueDate <= now;
            const isSnoozed = r.snoozeUntil && now < new Date(r.snoozeUntil);

            if (isDue && !r.notified && !isSnoozed) {
                dueReminders.push(r);
                return { ...r, notified: true }; // Mark as notified immediately
            }
            return r;
        });

        if (dueReminders.length > 0) {
            setReminders(updatedReminders);

            dueReminders.forEach(r => {
                playNotificationSound(r.notificationSound);
                
                if (document.hidden) { // Background tab
                    if (Notification.permission === 'granted') {
                         new Notification('Bill Reminder', {
                            body: `${r.billName} for $${r.amount.toFixed(2)} is due!`,
                            silent: r.notificationSound !== 'default',
                        });
                    }
                } else { // Active tab
                    setActiveNotifications(prev => [...prev.filter(n => n.id !== r.id), r]);
                }
            });
        }
    }, [reminders, setReminders, playNotificationSound]);

    useEffect(() => {
        const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [checkReminders]);

    const { totalIncome, totalExpenses, balance } = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
    }, [filteredTransactions]);
    
    // Transaction Handlers
    const handleSaveTransaction = (transaction: Transaction) => {
        setTransactions(prev => {
            const existing = prev.find(t => t.id === transaction.id);
            if (existing) {
                return prev.map(t => t.id === transaction.id ? transaction : t);
            }
            return [...prev, transaction];
        });
        setTransactionToEdit(null);
    };
    
    const handleEditTransaction = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setTransactionModalOpen(true);
    };

    const handleDeleteTransaction = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const openAddTransactionModal = () => {
        setTransactionToEdit(null);
        setTransactionModalOpen(true);
    };
    
    // Reminder Handlers
    const handleSaveReminder = (reminder: Reminder) => {
         setReminders(prev => {
            const existing = prev.find(r => r.id === reminder.id);
            if (existing) {
                return prev.map(r => r.id === reminder.id ? reminder : r);
            }
            return [...prev, reminder];
        });
        setReminderToEdit(null);
    };

    const handleEditReminder = (reminder: Reminder) => {
        setReminderToEdit(reminder);
        setReminderModalOpen(true);
    };

    const handleDeleteReminder = (id: string) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    const openAddReminderModal = () => {
        setReminderToEdit(null);
        setReminderModalOpen(true);
    };
    
    const handleSnoozeReminder = (id: string) => {
        setReminders(prev => prev.map(r => {
            if (r.id === id) {
                const snoozeUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();
                return { ...r, snoozeUntil, notified: false };
            }
            return r;
        }));
        setActiveNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleDismissNotification = (id: string) => {
        setActiveNotifications(prev => prev.filter(n => n.id !== id));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="min-h-screen text-slate-800 dark:text-slate-200">
            <NotificationContainer 
                notifications={activeNotifications} 
                onDismiss={handleDismissNotification} 
                onSnooze={handleSnoozeReminder}
            />
            <header className="bg-white dark:bg-slate-800 shadow-md p-4 sticky top-0 z-40">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-blue-600">Personal Budget Tracker</h1>
                    <div className="flex items-center">
                        <span className="text-slate-600 dark:text-slate-300 mr-4 hidden sm:inline" aria-label={`Welcome message for ${user.username}`}>
                            Welcome, <strong>{user.username}</strong>!
                        </span>
                        <button onClick={onLogout} className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-6">
                <MonthNavigator viewDate={viewDate} setViewDate={setViewDate} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <SummaryCard title="Total Income" value={formatCurrency(totalIncome)} color="text-green-500" />
                    <SummaryCard title="Total Expenses" value={formatCurrency(totalExpenses)} color="text-red-500" />
                    <SummaryCard title="Balance" value={formatCurrency(balance)} color={balance >= 0 ? 'text-blue-500' : 'text-red-500'} />
                </div>

                <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <TabButton title="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <TabButton title="Transactions" active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
                        <TabButton title="Reminders" active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} />
                    </nav>
                </div>

                <div>
                    {activeTab === 'dashboard' && <DashboardView transactions={filteredTransactions} />}
                    {activeTab === 'transactions' && <TransactionsView transactions={filteredTransactions} onAdd={openAddTransactionModal} onEdit={handleEditTransaction} onDelete={handleDeleteTransaction} />}
                    {activeTab === 'reminders' && <RemindersView reminders={filteredReminders} onAdd={openAddReminderModal} onEdit={handleEditReminder} onDelete={handleDeleteReminder} />}
                </div>
            </main>

            <TransactionModal 
                isOpen={isTransactionModalOpen}
                onClose={() => setTransactionModalOpen(false)}
                onSave={handleSaveTransaction}
                transactionToEdit={transactionToEdit}
            />

            <ReminderModal
                isOpen={isReminderModalOpen}
                onClose={() => setReminderModalOpen(false)}
                onSave={handleSaveReminder}
                reminderToEdit={reminderToEdit}
            />
        </div>
    );
};

const MonthNavigator: React.FC<{ viewDate: Date; setViewDate: (date: Date) => void; }> = ({ viewDate, setViewDate }) => {
    const isCurrentMonth = useMemo(() => {
        const today = new Date();
        return today.getFullYear() === viewDate.getFullYear() && today.getMonth() === viewDate.getMonth();
    }, [viewDate]);

    const changeMonth = (amount: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + amount, 1);
        setViewDate(newDate);
    };

    const goToCurrentMonth = () => {
        setViewDate(new Date());
    };

    return (
        <div className="flex items-center justify-center gap-4 my-6 p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Previous month">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                    {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                {!isCurrentMonth && (
                    <button onClick={goToCurrentMonth} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        Go to Current Month
                    </button>
                )}
            </div>
            <button onClick={() => changeMonth(1)} disabled={isCurrentMonth} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Next month">
                <ChevronRightIcon className="w-6 h-6" />
            </button>
        </div>
    );
};

const SummaryCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
);

const TabButton: React.FC<{ title: string; active: boolean; onClick: () => void }> = ({ title, active, onClick }) => (
    <button
        onClick={onClick}
        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-t-sm
            ${active 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600'
            }`}
        aria-current={active ? 'page' : undefined}
    >
        {title}
    </button>
);


const DashboardView: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
            <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
            <ExpensePieChart transactions={transactions} />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
            <h3 className="text-lg font-semibold mb-4">Last 7 Days Summary</h3>
            <WeeklySummaryBarChart transactions={transactions} />
        </div>
    </div>
);

const TransactionsView: React.FC<{
    transactions: Transaction[],
    onAdd: () => void,
    onEdit: (t: Transaction) => void,
    onDelete: (id: string) => void
}> = ({ transactions, onAdd, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">All Transactions</h3>
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <PlusIcon className="w-4 h-4" /> Add Transaction
            </button>
        </div>
        <div className="overflow-x-auto">
            {transactions.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Type</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Category</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                            <tr key={t.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                                        {t.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{t.category}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button onClick={() => onEdit(t)} className="text-blue-600 hover:text-blue-900 mr-3" aria-label={`Edit transaction ${t.description || t.category}`}><PencilIcon/></button>
                                    <button onClick={() => onDelete(t.id)} className="text-red-600 hover:text-red-900" aria-label={`Delete transaction ${t.description || t.category}`}><TrashIcon/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p className="text-center text-slate-500 py-8">No transactions for this month.</p>
            )}
        </div>
    </div>
);


const RemindersView: React.FC<{
    reminders: Reminder[],
    onAdd: () => void,
    onEdit: (r: Reminder) => void,
    onDelete: (id: string) => void
}> = ({ reminders, onAdd, onEdit, onDelete }) => (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-5">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Bill Reminders</h3>
            <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <PlusIcon className="w-4 h-4" /> Add Reminder
            </button>
        </div>
        <div className="space-y-4">
            {reminders.length > 0 ? (
                reminders.sort((a,b) => new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime()).map(r => (
                    <div key={r.id} className={`p-4 rounded-lg flex items-center justify-between ${new Date(`${r.dueDate}T${r.dueTime}`) < new Date() && !r.notified ? 'bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                        <div>
                            <p className="font-semibold">{r.billName}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {new Date(`${r.dueDate}T${r.dueTime}`).toLocaleString()} - ${r.amount.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <button onClick={() => onEdit(r)} className="text-blue-600 hover:text-blue-900 mr-3" aria-label={`Edit reminder ${r.billName}`}><PencilIcon/></button>
                            <button onClick={() => onDelete(r.id)} className="text-red-600 hover:text-red-900" aria-label={`Delete reminder ${r.billName}`}><TrashIcon/></button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-slate-500 py-8">No reminders for this month.</p>
            )}
        </div>
    </div>
);

// --- Notification Components ---

const NotificationToast: React.FC<{ 
    notification: Reminder; 
    onDismiss: (id: string) => void;
    onSnooze: (id: string) => void;
}> = ({ notification, onDismiss, onSnooze }) => {
    return (
        <div className="bg-white dark:bg-slate-700 rounded-lg shadow-lg p-4 w-full max-w-sm">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-blue-600 dark:text-blue-400">Bill Reminder</p>
                    <p className="text-sm text-slate-800 dark:text-slate-200 mt-1">{notification.billName} for ${notification.amount.toFixed(2)} is due.</p>
                </div>
                <button onClick={() => onDismiss(notification.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Dismiss notification">
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button 
                    onClick={() => onSnooze(notification.id)}
                    className="px-3 py-1 text-xs font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
                >
                    Snooze (10 min)
                </button>
                 <button 
                    onClick={() => onDismiss(notification.id)}
                    className="px-3 py-1 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
};

const NotificationContainer: React.FC<{
    notifications: Reminder[];
    onDismiss: (id: string) => void;
    onSnooze: (id: string) => void;
}> = ({ notifications, onDismiss, onSnooze }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] space-y-2">
            {notifications.map(n => (
                <NotificationToast key={n.id} notification={n} onDismiss={onDismiss} onSnooze={onSnooze} />
            ))}
        </div>
    );
};


export default App;