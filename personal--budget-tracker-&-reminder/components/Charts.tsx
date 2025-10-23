
import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Transaction } from '../types';

interface ChartsProps {
    transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export const ExpensePieChart: React.FC<ChartsProps> = ({ transactions }) => {
    const expenseData = useMemo(() => {
        const expenseByCategory = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {} as { [key: string]: number });

        return Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    if (expenseData.length === 0) {
        return <div className="flex items-center justify-center h-64 text-slate-500">No expense data to display.</div>;
    }

    return (
        <div className="w-full h-80">
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const WeeklySummaryBarChart: React.FC<ChartsProps> = ({ transactions }) => {
    const weeklyData = useMemo(() => {
        const dataByDay: { name: string; income: number; expenses: number }[] = Array(7).fill(null).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return {
                name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                income: 0,
                expenses: 0,
            };
        }).reverse();

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - tDate.getTime()) / (1000 * 3600 * 24));

            if (diffDays >= 0 && diffDays < 7) {
                const dayIndex = 6 - diffDays;
                if (t.type === 'income') {
                    dataByDay[dayIndex].income += t.amount;
                } else {
                    dataByDay[dayIndex].expenses += t.amount;
                }
            }
        });

        return dataByDay;
    }, [transactions]);

    return (
        <div className="w-full h-80">
            <ResponsiveContainer>
                <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="income" fill="#22c55e" />
                    <Bar dataKey="expenses" fill="#ef4444" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
