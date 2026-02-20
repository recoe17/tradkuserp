'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { Plus, Search, Eye, Download, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  total: number;
  balance: number;
  paidAmount: number;
  customer: {
    name: string;
  };
  dueDate: string;
  issueDate: string;
}

export default function InvoicesPage() {
  const api = useApi();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/invoices', { params });
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (id: string, invoiceNumber: string) => {
    const token = localStorage.getItem('token');
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/invoices/${id}/pdf?token=${token}`,
      '_blank'
    );
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <Link
            href="/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Link>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <li key={invoice.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-900">Customer: {invoice.customer.name}</p>
                      <p className="text-sm text-gray-500">
                        Issue Date: {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due Date: {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                      </p>
                      <div className="mt-2 flex items-center space-x-4">
                        <p className="text-sm font-semibold text-gray-900">
                          Total: ${Number(invoice.total).toFixed(2)}
                        </p>
                        {Number(invoice.paidAmount) > 0 && (
                          <p className="text-sm text-green-600">
                            Paid: ${Number(invoice.paidAmount).toFixed(2)}
                          </p>
                        )}
                        {Number(invoice.balance) > 0 && (
                          <p className="text-sm text-red-600">
                            Balance: ${Number(invoice.balance).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                        className="text-green-600 hover:text-green-900"
                        title="Download PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      {Number(invoice.balance) > 0 && (
                        <Link
                          href={`/invoices/${invoice.id}/payment`}
                          className="text-green-600 hover:text-green-900"
                          title="Add Payment"
                        >
                          <DollarSign className="h-5 w-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No invoices found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
