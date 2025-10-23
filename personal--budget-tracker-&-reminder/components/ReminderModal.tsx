
import React, { useState, useEffect } from 'react';
import { Reminder } from '../types';
import { XMarkIcon } from './icons';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (reminder: Reminder) => void;
    reminderToEdit: Reminder | null;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ isOpen, onClose, onSave, reminderToEdit }) => {
    const [billName, setBillName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [dueTime, setDueTime] = useState('');
    const [notificationSound, setNotificationSound] = useState<Reminder['notificationSound']>('default');

    useEffect(() => {
        if (reminderToEdit) {
            setBillName(reminderToEdit.billName);
            setAmount(String(reminderToEdit.amount));
            setDueDate(reminderToEdit.dueDate);
            setDueTime(reminderToEdit.dueTime);
            setNotificationSound(reminderToEdit.notificationSound || 'default');
        } else {
            resetForm();
        }
    }, [reminderToEdit, isOpen]);
    
    const resetForm = () => {
        setBillName('');
        setAmount('');
        const today = new Date();
        setDueDate(today.toISOString().split('T')[0]);
        setDueTime(today.toTimeString().substring(0,5));
        setNotificationSound('default');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newDueDate = new Date(`${dueDate}T${dueTime}`);
        // Check if the date was edited and pushed into the future
        const shouldResetStatus = reminderToEdit && 
            (reminderToEdit.dueDate !== dueDate || reminderToEdit.dueTime !== dueTime) && 
            newDueDate > new Date();

        const newReminder: Reminder = {
            id: reminderToEdit ? reminderToEdit.id : new Date().getTime().toString(),
            billName,
            amount: parseFloat(amount),
            dueDate,
            dueTime,
            notificationSound,
            notified: shouldResetStatus ? false : (reminderToEdit ? reminderToEdit.notified : false),
            snoozeUntil: shouldResetStatus ? null : (reminderToEdit ? reminderToEdit.snoozeUntil : null)
        };
        onSave(newReminder);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        {reminderToEdit ? 'Edit Reminder' : 'Add Reminder'}
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                        <XMarkIcon />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bill Name</label>
                        <input
                            type="text"
                            value={billName}
                            onChange={(e) => setBillName(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                            placeholder="e.g., Rent, Electricity Bill"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                            required
                        />
                    </div>
                     <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Time</label>
                        <input
                            type="time"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notification Sound</label>
                        <select
                            value={notificationSound}
                            onChange={(e) => setNotificationSound(e.target.value as Reminder['notificationSound'])}
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                        >
                            <option value="default">Default</option>
                            <option value="beep">Beep</option>
                            <option value="chime">Chime</option>
                            <option value="vibrate">Vibrate Only</option>
                            <option value="none">Silent</option>
                        </select>
                    </div>
                    <div className="flex justify-end">
                        <button type="button" onClick={onClose} className="mr-2 px-4 py-2 rounded-md text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReminderModal;