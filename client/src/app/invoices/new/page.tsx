'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { formatAmount, getCurrencySymbol } from '@/lib/currency';
import { Plus, Trash2, Search } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
}

interface Job {
  id: string;
  jobNumber: string;
  title: string;
}

interface CatalogItem {
  id: string;
  description: string;
  unitPrice: number;
  category: string | null;
}

interface LineItem {
  description: string;
  notes?: string;
  quantity: number;
  unitPrice: number;
  catalogItemId?: string;
}

export default function NewInvoicePage() {
  const api = useApi();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    jobId: '',
    dueDate: '',
    currency: 'USD' as 'USD' | 'ZIG' | 'ZAR',
    notes: '',
    terms: '',
    discount: 0,
    includeVat: true,
  });
  const [items, setItems] = useState<LineItem[]>([
    { description: '', notes: '', quantity: 1, unitPrice: 0 },
  ]);
  const [creatingCatalogIndex, setCreatingCatalogIndex] = useState<number | null>(null);
  const [activeItemRow, setActiveItemRow] = useState<number | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const justSelectedRef = useRef(false);
  const itemSearchQueryRef = useRef('');

  useEffect(() => {
    fetchCustomers();
    fetchJobs();
    fetchCatalogItems();
    // Set default due date to 30 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      dueDate: defaultDueDate.toISOString().split('T')[0],
    }));
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers');
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchCatalogItems = async () => {
    try {
      const response = await api.get('/quotation-items');
      setCatalogItems(response.data);
    } catch (error) {
      console.error('Failed to fetch catalog items:', error);
    }
  };

  const selectCatalogItem = (index: number, catalogItemId: string) => {
    const newItems = [...items];
    if (catalogItemId === '__custom__') {
      newItems[index] = { ...newItems[index], description: '', unitPrice: 0 };
    } else {
      const catalog = catalogItems.find((c) => c.id === catalogItemId);
      if (catalog) {
        newItems[index] = {
          ...newItems[index],
          description: catalog.description,
          quantity: newItems[index].quantity,
          unitPrice: catalog.unitPrice,
          catalogItemId: catalog.id,
        };
      }
    }
    setItems(newItems);
  };

  const createCatalogItemFromSearch = async (index: number, description: string) => {
    const row = items[index];
    if (!description.trim()) return;
    justSelectedRef.current = true;
    try {
      setCreatingCatalogIndex(index);
      const response = await api.post('/quotation-items', {
        description: description.trim(),
        unitPrice: row.unitPrice || 0,
        category: null,
      });
      const newItem: CatalogItem = response.data;
      setCatalogItems((prev) => [...prev, newItem]);
      selectCatalogItem(index, newItem.id);
      setActiveItemRow(null);
      setItemSearchQuery('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create catalog item');
    } finally {
      setCreatingCatalogIndex(null);
    }
  };

  const handleSelectItem = (index: number, catalog: CatalogItem) => {
    justSelectedRef.current = true;
    selectCatalogItem(index, catalog.id);
    setActiveItemRow(null);
    setItemSearchQuery('');
  };

  const addItem = () => {
    setItems([...items, { description: '', notes: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const VAT_RATE = 0.155; // 15.5% VAT
  
  const calculateVat = () => {
    if (!formData.includeVat) return 0;
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return subtotal * VAT_RATE;
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const vatAmount = calculateVat();
    const discountAmount = formData.discount || 0;
    return subtotal + vatAmount - discountAmount;
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/invoices', {
        ...formData,
        tax: calculateVat(),
        items: items.map(item => ({
          ...item,
          total: item.quantity * item.unitPrice,
        })),
      });
      router.push('/invoices');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Invoice</h1>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                Customer *
              </label>
              <select
                id="customerId"
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">
                Job (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-1">Link to a project for tracking</p>
              <select
                id="jobId"
                value={formData.jobId}
                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="">Select job</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.jobNumber} - {job.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as 'USD' | 'ZIG' | 'ZAR' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              >
                <option value="USD">USD ($)</option>
                <option value="ZIG">ZIG (Z$)</option>
                <option value="ZAR">ZAR (R)</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200" style={{ overflow: 'visible' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => {
                    const q = activeItemRow === index ? itemSearchQuery : '';
                    const matches =
                      q.length > 0
                        ? catalogItems.filter((c) =>
                            c.description.toLowerCase().includes(q.toLowerCase())
                          )
                        : catalogItems;
                    const hasExactMatch = catalogItems.some(
                      (c) => c.description.toLowerCase() === q.toLowerCase()
                    );
                    const showCreate = q.trim().length >= 2 && !hasExactMatch;

                    return (
                    <tr key={index}>
                      <td className="px-4 py-3 relative">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={activeItemRow === index ? itemSearchQuery : (item.description || '')}
                            onChange={(e) => {
                              const v = e.target.value;
                              itemSearchQueryRef.current = v;
                              setItemSearchQuery(v);
                              if (activeItemRow !== index) setActiveItemRow(index);
                            }}
                            onFocus={() => {
                              setActiveItemRow(index);
                              const d = item.description || '';
                              itemSearchQueryRef.current = d;
                              setItemSearchQuery(d);
                            }}
                            onBlur={() => {
                              const q = itemSearchQueryRef.current;
                              setTimeout(() => {
                                if (!justSelectedRef.current) {
                                  updateItem(index, 'description', q);
                                }
                                justSelectedRef.current = false;
                                setActiveItemRow(null);
                              }, 200);
                            }}
                            className="w-full min-w-[200px] pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                            placeholder="Type an item name"
                          />
                        </div>
                        {activeItemRow === index && (
                          <div className="absolute z-[100] mt-1 w-full min-w-[280px] max-h-56 overflow-auto bg-white border border-gray-200 rounded-md shadow-lg">
                            {(catalogItems.length === 0 && q.length === 0) ? (
                              <div className="px-3 py-2 text-sm text-gray-500">Add items in Products & Services first</div>
                            ) : matches.length > 0 ? matches.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); handleSelectItem(index, c); }}
                                className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left"
                              >
                                <span>{c.description}</span>
                                <span className="text-gray-500 font-medium ml-2">{formatAmount(Number(c.unitPrice), formData.currency)}</span>
                              </button>
                            )) : null}
                            {showCreate && (
                              <button
                                type="button"
                                disabled={creatingCatalogIndex === index}
                                onMouseDown={(e) => { e.preventDefault(); createCatalogItemFromSearch(index, q); }}
                                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-100"
                              >
                                {creatingCatalogIndex === index ? 'Creating...' : `+ Create "${q.trim()}" as new item`}
                              </button>
                            )}
                            {q.length > 0 && matches.length === 0 && !showCreate && (
                              <div className="px-3 py-2 text-sm text-gray-500">Type 2+ characters to create new item</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.notes || ''}
                          onChange={(e) => updateItem(index, 'notes', e.target.value)}
                          className="w-full min-w-[180px] border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                          placeholder="Enter item description"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-red-500 focus:border-red-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatAmount(item.quantity * item.unitPrice, formData.currency)}
                      </td>
                      <td className="px-4 py-3">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
            <div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="includeVat"
                  checked={formData.includeVat}
                  onChange={(e) => setFormData({ ...formData, includeVat: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="includeVat" className="ml-2 block text-sm font-medium text-gray-700">
                  Include VAT (15.5%)
                </label>
              </div>

              <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                Discount ({getCurrencySymbol(formData.currency)})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                id="discount"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between py-1">
                <span className="text-sm text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium">{formatAmount(subtotal, formData.currency)}</span>
              </div>
              {formData.includeVat && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600">VAT (15.5%):</span>
                  <span className="text-sm font-medium">{formatAmount(calculateVat(), formData.currency)}</span>
                </div>
              )}
              {formData.discount > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600">Discount:</span>
                  <span className="text-sm font-medium text-red-600">-{formatAmount(formData.discount, formData.currency)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-red-600">{formatAmount(calculateTotal(), formData.currency)}</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
              Terms & Conditions
            </label>
            <textarea
              id="terms"
              rows={3}
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
