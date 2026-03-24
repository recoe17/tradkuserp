'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { ArrowLeft, Download, Mail, MessageSquare, FileText, Send, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { COMPANY } from '@/lib/company';
import { formatAmount } from '@/lib/currency';

interface QuotationItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Quotation {
  id: string;
  quotationNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency?: string;
  notes: string | null;
  terms: string | null;
  validUntil: string | null;
  createdAt: string;
  items: QuotationItem[];
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    company: string | null;
    address: string | null;
    tin?: string | null;
    vat?: string | null;
  };
  job: {
    id: string;
    title: string;
  } | null;
}

export default function QuotationViewPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuotation();
  }, [params.id]);

  const fetchQuotation = async () => {
    try {
      const response = await api.get(`/quotations/${params.id}`);
      setQuotation(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/quotations/${params.id}/pdf`, '_blank');
  };

  const [sending, setSending] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [converting, setConverting] = useState(false);

  const handleSendEmail = async () => {
    if (sending) return;
    setSending(true);
    try {
      const response = await api.post(`/quotations/${params.id}/send-email`);
      // Automatically mark as sent after emailing
      if (quotation?.status === 'draft') {
        await api.put(`/quotations/${params.id}`, { status: 'sent' });
      }
      alert(response.data.message || 'Quotation sent via email successfully');
      fetchQuotation();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      const response = await api.post(`/quotations/${params.id}/send-whatsapp`);
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      } else {
        alert(response.data.message || 'Quotation sent via WhatsApp successfully');
        fetchQuotation();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send WhatsApp');
    }
  };

  const handleConvertToInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (converting) return;
    setConverting(true);
    try {
      const response = await api.post(`/invoices/from-quotation/${params.id}`, {
        dueDate: dueDate || undefined
      });
      setShowConvertModal(false);
      router.push(`/invoices/${response.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setConverting(false);
    }
  };

  const openConvertModal = () => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 30);
    setDueDate(defaultDue.toISOString().split('T')[0]);
    setShowConvertModal(true);
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await api.put(`/quotations/${params.id}`, { status: newStatus });
      fetchQuotation();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quotation? This cannot be undone.')) return;
    try {
      await api.delete(`/quotations/${params.id}`);
      router.push('/quotations');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete quotation');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (error || !quotation) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Quotation not found'}</p>
          <Link href="/quotations" className="text-red-600 hover:underline">
            Back to Quotations
          </Link>
        </div>
      </Layout>
    );
  }

  const items = Array.isArray(quotation.items) ? quotation.items : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/quotations" className="mr-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Quotation {quotation.quotationNumber}
            </h1>
            <span className={`ml-4 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(quotation.status)}`}>
              {quotation.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <Link
              href={`/quotations/${params.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            {quotation.customer.email && (
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Email'}
              </button>
            )}
            {quotation.customer.phone && (
              <button
                onClick={handleSendWhatsApp}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </button>
            )}
          </div>
        </div>

        {/* Status Actions */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Status Actions</h3>
              <p className="text-xs text-gray-500">Change the quotation status</p>
            </div>
            <div className="flex space-x-2">
              {quotation.status === 'draft' && (
                <button
                  onClick={() => updateStatus('sent')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-1" />
                  Mark as Sent
                </button>
              )}
              {quotation.status === 'sent' && (
                <>
                  <button
                    onClick={() => updateStatus('accepted')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Mark as Accepted
                  </button>
                  <button
                    onClick={() => updateStatus('rejected')}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Mark as Rejected
                  </button>
                </>
              )}
              {(quotation.status === 'accepted' || quotation.status === 'rejected') && (
                <button
                  onClick={() => updateStatus('draft')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Reset to Draft
                </button>
              )}
              <button
                onClick={openConvertModal}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <FileText className="h-4 w-4 mr-1" />
                Convert to Invoice
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Convert to Invoice Modal */}
        {showConvertModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowConvertModal(false)} />
              <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Convert Quotation to Invoice</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This will create a new invoice from quotation <strong>{quotation.quotationNumber}</strong> for <strong>{formatAmount(Number(quotation.total), quotation.currency || 'USD')}</strong>.
                </p>
                <form onSubmit={handleConvertToInvoice}>
                  <div className="mb-4">
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Invoice Due Date
                    </label>
                    <input
                      type="date"
                      id="dueDate"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowConvertModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={converting}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                      {converting ? 'Creating...' : 'Create Invoice'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Red accent bar */}
          <div className="h-2 bg-red-600"></div>
          
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <img src="/tradkus-logo.png" alt="Tradkuserp Logo" className="h-12 w-auto max-w-[140px] object-contain mb-2" />
                <p className="text-sm text-gray-600">The best way to power up</p>
                <p className="text-sm text-gray-600 mt-1">{COMPANY.address}</p>
                <p className="text-sm text-gray-600">TIN: {COMPANY.tin}</p>
                <p className="text-sm text-gray-600">{COMPANY.phone} | {COMPANY.phoneAlt}</p>
                <p className="text-sm text-gray-600">{COMPANY.email}</p>
                <p className="text-sm text-gray-600">{COMPANY.website}</p>
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-red-600">QUOTATION</h3>
                <p className="text-sm text-gray-600 mt-2">#{quotation.quotationNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">BILL TO</h4>
                <p className="text-gray-900 font-medium">{quotation.customer.name}</p>
                <div className="mt-1 space-y-1 text-sm text-gray-600">
                  {quotation.customer.company && (
                    <p><span className="inline-block w-14 text-gray-500">Company:</span> {quotation.customer.company}</p>
                  )}
                  {quotation.customer.address && (
                    <p><span className="inline-block w-14 text-gray-500">Address:</span> {quotation.customer.address}</p>
                  )}
                  {quotation.customer.email && (
                    <p><span className="inline-block w-14 text-gray-500">Email:</span> {quotation.customer.email}</p>
                  )}
                  {quotation.customer.phone && (
                    <p><span className="inline-block w-14 text-gray-500">Phone:</span> {quotation.customer.phone}</p>
                  )}
                  {quotation.customer.tin && (
                    <p><span className="inline-block w-14 text-gray-500">TIN:</span> {quotation.customer.tin}</p>
                  )}
                  {quotation.customer.vat && (
                    <p><span className="inline-block w-14 text-gray-500">VAT:</span> {quotation.customer.vat}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-600">
                  <span className="font-medium">Date:</span>{' '}
                  {format(new Date(quotation.createdAt), 'MMMM dd, yyyy')}
                </p>
                {quotation.validUntil && (
                  <p className="text-gray-600">
                    <span className="font-medium">Valid Until:</span>{' '}
                    {format(new Date(quotation.validUntil), 'MMMM dd, yyyy')}
                  </p>
                )}
                {quotation.job && (
                  <p className="text-gray-600">
                    <span className="font-medium">Job:</span>{' '}
                    <Link href={`/jobs/${quotation.job.id}`} className="text-red-600 hover:underline">
                      {quotation.job.title}
                    </Link>
                  </p>
                )}
              </div>
            </div>

            <div className="mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatAmount(Number(item.unitPrice), quotation.currency || 'USD')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatAmount(item.quantity * item.unitPrice, quotation.currency || 'USD')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">{formatAmount(Number(quotation.subtotal), quotation.currency || 'USD')}</span>
                </div>
                {Number(quotation.tax) > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">VAT (15.5%):</span>
                    <span className="text-gray-900">{formatAmount(Number(quotation.tax), quotation.currency || 'USD')}</span>
                  </div>
                )}
                {Number(quotation.discount) > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900">-{formatAmount(Number(quotation.discount), quotation.currency || 'USD')}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t-2 border-red-600 font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-red-600 text-lg">{formatAmount(Number(quotation.total), quotation.currency || 'USD')}</span>
                </div>
              </div>
            </div>

            {quotation.notes && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{quotation.notes}</p>
              </div>
            )}

            {quotation.terms && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Terms & Conditions</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{quotation.terms}</p>
              </div>
            )}

            <div className="mt-8 space-y-4">
              {COMPANY.banks.map((bank) => (
                <div key={bank.title} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium text-red-600 mb-3">Bank Details ({bank.title})</h4>
                  <p className="text-sm text-gray-900"><span className="font-medium">Bank:</span> {bank.name}</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Account Name:</span> {bank.accountName}</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Account Number:</span> {bank.accountNumber}</p>
                  <p className="text-sm text-gray-900"><span className="font-medium">Branch:</span> {bank.branch}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
