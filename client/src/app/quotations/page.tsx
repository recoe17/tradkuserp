'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { Plus, Search, Eye, Mail, MessageSquare, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Quotation {
  id: string;
  quotationNumber: string;
  status: string;
  total: number;
  customer: {
    name: string;
    email: string | null;
    phone: string;
  };
  validUntil: string | null;
  createdAt: string;
}

export default function QuotationsPage() {
  const api = useApi();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const response = await api.get('/quotations');
      setQuotations(response.data);
    } catch (error) {
      console.error('Failed to fetch quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (id: string) => {
    try {
      await api.post(`/quotations/${id}/send-email`);
      alert('Quotation sent via email successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send email');
    }
  };

  const handleSendWhatsApp = async (id: string) => {
    try {
      await api.post(`/quotations/${id}/send-whatsapp`);
      alert('Quotation sent via WhatsApp successfully');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send WhatsApp');
    }
  };

  const handleDownloadPDF = (id: string, quotationNumber: string) => {
    window.open(`/api/quotations/${id}/pdf`, '_blank');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredQuotations = quotations.filter(
    (quotation) =>
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <Link
            href="/quotations/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Quotation
          </Link>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quotations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full max-w-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredQuotations.map((quotation) => (
              <li key={quotation.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{quotation.quotationNumber}</p>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quotation.status)}`}>
                          {quotation.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-900">Customer: {quotation.customer.name}</p>
                      <p className="text-sm text-gray-500">
                        Created: {format(new Date(quotation.createdAt), 'MMM dd, yyyy')}
                      </p>
                      {quotation.validUntil && (
                        <p className="text-sm text-gray-500">
                          Valid Until: {format(new Date(quotation.validUntil), 'MMM dd, yyyy')}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        Total: ${Number(quotation.total).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/quotations/${quotation.id}`}
                        className="text-red-600 hover:text-red-900"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDownloadPDF(quotation.id, quotation.quotationNumber)}
                        className="text-green-600 hover:text-green-900"
                        title="Download PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      {quotation.customer.email && (
                        <button
                          onClick={() => handleSendEmail(quotation.id)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Send Email"
                        >
                          <Mail className="h-5 w-5" />
                        </button>
                      )}
                      {quotation.customer.phone && (
                        <button
                          onClick={() => handleSendWhatsApp(quotation.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Send WhatsApp"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {filteredQuotations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No quotations found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
