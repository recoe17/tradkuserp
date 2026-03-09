'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { FileCheck, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatAmount } from '@/lib/currency';

interface Payment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  paidAt: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    currency?: string;
    customer: {
      id: string;
      name: string;
      company: string | null;
    };
  };
}

export default function ReceiptsPage() {
  const api = useApi();
  const [receipts, setReceipts] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await api.get('/payments');
      setReceipts(response.data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReceipts = receipts.filter((r) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      r.invoice?.customer?.name?.toLowerCase().includes(q) ||
      r.invoice?.invoiceNumber?.toLowerCase().includes(q) ||
      r.reference?.toLowerCase().includes(q)
    );
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Receipts</h1>
            <p className="text-sm text-gray-500 mt-1">Receipts are created when you Record Payment on an invoice</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <input
              type="text"
              placeholder="Search by customer, invoice, reference..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-80 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {filteredReceipts.length === 0 ? (
              <li className="px-6 py-12 text-center text-gray-500">
                No receipts found
              </li>
            ) : (
              filteredReceipts.map((payment) => (
                <li key={payment.id}>
                  <div className="flex items-center justify-between hover:bg-gray-50 px-6 py-4">
                    <Link
                      href={`/invoices/${payment.invoice?.id}`}
                      className="flex-1 flex items-center"
                    >
                      <div className="flex-shrink-0 bg-red-50 rounded-md p-2">
                        <FileCheck className="h-6 w-6 text-red-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.invoice?.customer?.name}
                          {payment.invoice?.customer?.company && (
                            <span className="text-gray-500 ml-1">
                              ({payment.invoice.customer.company})
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Invoice #{payment.invoice?.invoiceNumber} •{' '}
                          {format(new Date(payment.paidAt), 'MMM dd, yyyy')} •{' '}
                          {payment.method.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-600">
                          {formatAmount(Number(payment.amount), payment.invoice?.currency || 'USD')}
                        </p>
                        {payment.reference && (
                          <p className="text-xs text-gray-500">Ref: {payment.reference}</p>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`/api/payments/${payment.id}/pdf`, '_blank');
                      }}
                      className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      title="Convert to Receipt"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Receipt
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </Layout>
  );
}
