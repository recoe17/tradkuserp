'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { ArrowLeft, Download, Mail, MessageSquare, DollarSign, FileCheck, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { COMPANY } from '@/lib/company';
import { formatAmount } from '@/lib/currency';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Payment {
  id: string;
  amount: number;
  method: string;
  reference: string | null;
  paidAt: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  currency?: string;
  notes: string | null;
  terms: string | null;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
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
  payments: Payment[];
}

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const api = useApi();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    fetchInvoice();
  }, [params.id]);

  const fetchInvoice = async () => {
    try {
      const response = await api.get(`/invoices/${params.id}`);
      setInvoice(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.open(`/api/invoices/${params.id}/pdf`, '_blank');
  };

  const [sending, setSending] = useState(false);

  const handleSendEmail = async () => {
    if (sending) return;
    setSending(true);
    try {
      const response = await api.post(`/invoices/${params.id}/send-email`);
      alert(response.data.message || 'Invoice sent via email successfully');
      fetchInvoice();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    try {
      const response = await api.post(`/invoices/${params.id}/send-whatsapp`);
      if (response.data.whatsappUrl) {
        window.open(response.data.whatsappUrl, '_blank');
      } else {
        alert(response.data.message || 'Invoice sent via WhatsApp successfully');
        fetchInvoice();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send WhatsApp');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice? All associated payments will also be deleted. This cannot be undone.')) return;
    try {
      await api.delete(`/invoices/${params.id}`);
      router.push('/invoices');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        invoiceId: params.id,
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        reference: paymentReference || undefined,
        notes: paymentNotes || undefined,
      });
      setShowPaymentForm(false);
      setPaymentAmount('');
      setPaymentReference('');
      setPaymentNotes('');
      fetchInvoice();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
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

  if (error || !invoice) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || 'Invoice not found'}</p>
          <Link href="/invoices" className="text-red-600 hover:underline">
            Back to Invoices
          </Link>
        </div>
      </Layout>
    );
  }

  const items = Array.isArray(invoice.items) ? invoice.items : [];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link href="/invoices" className="mr-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Invoice {invoice.invoiceNumber}
            </h1>
            <span className={`ml-4 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            {invoice.customer.email && (
              <button
                onClick={handleSendEmail}
                disabled={sending}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Mail className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Email'}
              </button>
            )}
            {invoice.customer.phone && (
              <button
                onClick={handleSendWhatsApp}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </button>
            )}
            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
              <button
                onClick={() => setShowPaymentForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Record Payment
              </button>
            )}
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        </div>

        {showPaymentForm && (
          <div className="bg-white shadow sm:rounded-lg mb-6 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Record Payment</h3>
            <p className="text-sm text-gray-500 mb-4">Recording a payment creates a receipt. It appears under Receipts.</p>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder={`Max: ${formatAmount(Number(invoice.balance), invoice.currency || 'USD')}`}
                    max={invoice.balance}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="card">Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reference</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="Transaction reference"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (what it’s for)</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g. Deposit for installation, Payment for materials, etc."
                  rows={2}
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Save Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Red accent bar */}
          <div className="h-2 bg-red-600"></div>
          
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <img src="/logo.png" alt="Tradkuserp Logo" className="h-16 mb-2" />
                <p className="text-sm text-gray-600">The best way to power up</p>
                <p className="text-sm text-gray-600 mt-1">{COMPANY.address}</p>
                <p className="text-sm text-gray-600">TIN: {COMPANY.tin}</p>
                <p className="text-sm text-gray-600">{COMPANY.phone} | {COMPANY.phoneAlt}</p>
                <p className="text-sm text-gray-600">{COMPANY.email}</p>
                <p className="text-sm text-gray-600">{COMPANY.website}</p>
              </div>
              <div className="text-right">
                <h3 className="text-3xl font-bold text-red-600">INVOICE</h3>
                <p className="text-sm text-gray-600 mt-2">#{invoice.invoiceNumber}</p>
              </div>
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">BILL TO</h4>
                <p className="text-gray-900 font-medium">{invoice.customer.name}</p>
                <div className="mt-1 space-y-1 text-sm text-gray-600">
                  {invoice.customer.company && (
                    <p><span className="inline-block w-14 text-gray-500">Company:</span> {invoice.customer.company}</p>
                  )}
                  {invoice.customer.address && (
                    <p><span className="inline-block w-14 text-gray-500">Address:</span> {invoice.customer.address}</p>
                  )}
                  {invoice.customer.email && (
                    <p><span className="inline-block w-14 text-gray-500">Email:</span> {invoice.customer.email}</p>
                  )}
                  {invoice.customer.phone && (
                    <p><span className="inline-block w-14 text-gray-500">Phone:</span> {invoice.customer.phone}</p>
                  )}
                  {invoice.customer.tin && (
                    <p><span className="inline-block w-14 text-gray-500">TIN:</span> {invoice.customer.tin}</p>
                  )}
                  {invoice.customer.vat && (
                    <p><span className="inline-block w-14 text-gray-500">VAT:</span> {invoice.customer.vat}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-600">
                  <span className="font-medium">Issue Date:</span>{' '}
                  {format(new Date(invoice.issueDate), 'MMMM dd, yyyy')}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Due Date:</span>{' '}
                  {format(new Date(invoice.dueDate), 'MMMM dd, yyyy')}
                </p>
                {invoice.job && (
                  <p className="text-gray-600">
                    <span className="font-medium">Job:</span>{' '}
                    <Link href={`/jobs/${invoice.job.id}`} className="text-red-600 hover:underline">
                      {invoice.job.title}
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
                          {formatAmount(Number(item.unitPrice), invoice.currency || 'USD')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right">
                          {formatAmount(item.quantity * item.unitPrice, invoice.currency || 'USD')}
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
                  <span className="text-gray-900">{formatAmount(Number(invoice.subtotal), invoice.currency || 'USD')}</span>
                </div>
                {Number(invoice.tax) > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">VAT (15.5%):</span>
                    <span className="text-gray-900">{formatAmount(Number(invoice.tax), invoice.currency || 'USD')}</span>
                  </div>
                )}
                {Number(invoice.discount) > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-gray-900">-{formatAmount(Number(invoice.discount), invoice.currency || 'USD')}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t-2 border-red-600 font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-red-600 text-lg">{formatAmount(Number(invoice.total), invoice.currency || 'USD')}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Paid:</span>
                  <span className="text-green-600">{formatAmount(Number(invoice.paidAmount), invoice.currency || 'USD')}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg">
                  <span className="text-gray-900">Balance:</span>
                  <span className={invoice.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    {formatAmount(Number(invoice.balance), invoice.currency || 'USD')}
                  </span>
                </div>
              </div>
            </div>

            {invoice.payments && invoice.payments.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Payment History</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Receipt
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {format(new Date(payment.paidAt), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 capitalize">
                            {payment.method.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {payment.reference || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-green-600 text-right font-medium">
                            {formatAmount(Number(payment.amount), invoice.currency || 'USD')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => window.open(`/api/payments/${payment.id}/pdf`, '_blank')}
                              className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Convert to Receipt"
                            >
                              <FileCheck className="h-4 w-4 mr-1" />
                              Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {invoice.notes && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Notes</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {invoice.terms && (
              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Terms & Conditions</h4>
                <p className="text-gray-900 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
