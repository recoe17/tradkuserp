'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { DollarSign, FileText, Receipt, Briefcase, TrendingUp, TrendingDown } from 'lucide-react';

export default function DashboardPage() {
  const api = useApi();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalExpenses: 0,
    profit: 0,
    outstanding: 0,
    invoiceCount: 0,
    expenseCount: 0,
    paymentCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/financials/summary');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Paid',
      value: `$${stats.totalPaid.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Expenses',
      value: `$${stats.totalExpenses.toFixed(2)}`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      name: 'Profit',
      value: `$${stats.profit.toFixed(2)}`,
      icon: DollarSign,
      color: stats.profit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: stats.profit >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      name: 'Outstanding',
      value: `$${stats.outstanding.toFixed(2)}`,
      icon: Receipt,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Invoices',
      value: stats.invoiceCount,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 ${stat.bgColor} rounded-md p-3`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {stat.name}
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
