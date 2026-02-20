'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { DollarSign, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function FinancesPage() {
  const api = useApi();
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalExpenses: 0,
    outstanding: 0,
    profit: 0,
    invoiceCount: 0,
    expenseCount: 0,
    paymentCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const params: any = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      const response = await api.get('/financials/summary', { params });
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange({ ...dateRange, [field]: value });
  };

  const applyFilter = () => {
    setLoading(true);
    fetchSummary();
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Overview</h1>

        {/* Date Range Filter */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={applyFilter}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      ${summary.totalRevenue.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Paid
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      ${summary.totalPaid.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-50 rounded-md p-3">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Expenses
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      ${summary.totalExpenses.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className={`bg-white overflow-hidden shadow rounded-lg ${
            summary.profit >= 0 ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${
                  summary.profit >= 0 ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {summary.profit >= 0 ? (
                    <ArrowUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Profit/Loss
                    </dt>
                    <dd className={`text-lg font-semibold ${
                      summary.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${summary.profit.toFixed(2)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <p className="mt-2 text-2xl font-semibold text-yellow-600">
                  ${summary.outstanding.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Invoices</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {summary.invoiceCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-500">Expenses</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">
                  {summary.expenseCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
