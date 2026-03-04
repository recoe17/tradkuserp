'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { Plus, Search, Trash2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt: string | null;
  notes: string | null;
  job: {
    id: string;
    jobNumber: string;
    title: string;
    customer: { name: string };
  } | null;
}

const EXPENSE_CATEGORIES = [
  'Materials',
  'Labour',
  'Transport',
  'Equipment',
  'Utilities',
  'Office',
  'Other',
];

export default function ExpensesPage() {
  const api = useApi();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const fetchExpenses = async () => {
    try {
      const params: Record<string, string> = {};
      if (categoryFilter) params.category = categoryFilter;
      const response = await api.get('/expenses', { params });
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.job?.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <Link
            href="/expenses/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Expense
          </Link>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {filteredExpenses.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No expenses found.{' '}
              <Link href="/expenses/new" className="text-red-600 hover:underline">
                Record your first expense
              </Link>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  Total: <span className="text-red-600 font-bold">${totalAmount.toFixed(2)}</span>
                </p>
              </div>
              <ul className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <li key={expense.id} className="hover:bg-gray-50">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                        <p className="text-sm text-gray-500">
                          {expense.category}
                          {expense.job && (
                            <span> • {expense.job.jobNumber} - {expense.job.title}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(new Date(expense.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm font-bold text-red-600">
                          ${Number(expense.amount).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
