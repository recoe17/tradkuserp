'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { Plus, Trash2 } from 'lucide-react';

interface QuotationItem {
  id: string;
  description: string;
  unitPrice: number;
  category: string | null;
}

export default function ItemsPage() {
  const api = useApi();
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    unitPrice: '',
    category: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get('/quotation-items');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/quotation-items', {
        description: formData.description,
        unitPrice: parseFloat(formData.unitPrice),
        category: formData.category || null,
      });
      setFormData({ description: '', unitPrice: '', category: '' });
      setShowForm(false);
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this item from the catalog?')) return;
    try {
      await api.delete(`/quotation-items/${id}`);
      fetchItems();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete item');
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products & Services</h1>
            <p className="text-sm text-gray-500 mt-1">
              Add items (item name, default price, category) to use when creating quotations and invoices. Search by item name; use Description column for per-line notes.
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Item</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Item name *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Solar panel installation"
                />
                <p className="text-xs text-gray-500 mt-1">Shown in search when adding items to quotes/invoices</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Default Price ($) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-gray-700">Category (optional)</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Solar, Wiring"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Add Item
              </button>
            </div>
          </form>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {items.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No items yet. Add items to use in quotations.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    {item.category && (
                      <p className="text-xs text-gray-500">{item.category}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-sm font-medium text-gray-900">
                      ${Number(item.unitPrice).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
