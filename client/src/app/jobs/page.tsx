'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useApi } from '@/lib/clerk-api';
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Job {
  id: string;
  jobNumber: string;
  title: string;
  serviceType: string;
  status: string;
  priority: string;
  customer: {
    name: string;
  };
  startDate: string | null;
  endDate: string | null;
}

export default function JobsPage() {
  const api = useApi();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const fetchJobs = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/jobs', { params });
      setJobs(response.data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      await api.delete(`/jobs/${id}`);
      fetchJobs();
    } catch (error) {
      alert('Failed to delete job');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <Link
            href="/jobs/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Link>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
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
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredJobs.map((job) => (
              <li key={job.id}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">{job.jobNumber}</p>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(job.status)}`}>
                          {job.status.replace('_', ' ')}
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(job.priority)}`}>
                          {job.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-gray-900">{job.title}</p>
                      <p className="text-sm text-gray-500">Customer: {job.customer.name}</p>
                      <p className="text-sm text-gray-500">Service: {job.serviceType}</p>
                      {job.startDate && (
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(job.startDate), 'MMM dd, yyyy')}
                          {job.endDate && ` - ${format(new Date(job.endDate), 'MMM dd, yyyy')}`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
