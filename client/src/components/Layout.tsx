'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  FileCheck,
  DollarSign,
  CreditCard,
  Menu,
  X,
  LogOut,
  Plus,
  ChevronDown,
  Package,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const { user } = useUser();
  const { signOut } = useClerk();

  const createOptions = [
    { name: 'Quotation', href: '/quotations', icon: FileText },
    { name: 'Invoice', href: '/invoices/new', icon: Receipt },
    { name: 'Customer', href: '/customers/new', icon: Users },
    { name: 'Job', href: '/jobs/new', icon: Briefcase },
    { name: 'Bill', href: '/expenses/new', icon: CreditCard },
    { name: 'Product or Service', href: '/items', icon: Package },
  ];

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Products & Services', href: '/items', icon: Package },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Invoices', href: '/invoices', icon: Receipt },
    { name: 'Receipts', href: '/receipts', icon: FileCheck },
    { name: 'Expenses', href: '/expenses', icon: CreditCard },
    { name: 'Finances', href: '/finances', icon: DollarSign },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 flex flex-col bg-white shadow-xl">
          <div className="flex-shrink-0 flex h-20 items-center justify-between px-4 border-b bg-white">
            <Image src="/logo.png" alt="MaxVolt Electrical" width={150} height={50} className="object-contain" />
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 min-h-0 overflow-y-auto mt-4 px-2">
            <div className="mb-4 px-2" ref={createRef}>
              <button
                type="button"
                onClick={() => setCreateOpen(!createOpen)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                <span className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Create new
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${createOpen ? 'rotate-180' : ''}`} />
              </button>
              {createOpen && (
                <div className="mt-1 py-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  {createOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <Link
                        key={opt.name}
                        href={opt.href}
                        onClick={() => { setCreateOpen(false); setSidebarOpen(false); }}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Icon className="mr-3 h-4 w-4 text-gray-500" />
                        {opt.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 ${
                    isActive(item.href)
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 p-4 border-t bg-white">
            <button
              onClick={() => { signOut(); setSidebarOpen(false); }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:h-screen">
        <div className="flex flex-col h-full bg-white border-r border-gray-200 min-h-0">
          <div className="flex-shrink-0 flex h-20 items-center justify-center px-4 border-b bg-white">
            <Image src="/logo.png" alt="MaxVolt Electrical" width={180} height={60} className="object-contain" />
          </div>
          <nav className="flex-1 min-h-0 overflow-y-auto mt-4 px-2 space-y-1">
            <div className="mb-4 px-2" ref={createRef}>
              <button
                type="button"
                onClick={() => setCreateOpen(!createOpen)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                <span className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Create new
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${createOpen ? 'rotate-180' : ''}`} />
              </button>
              {createOpen && (
                <div className="mt-1 py-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  {createOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <Link
                        key={opt.name}
                        href={opt.href}
                        onClick={() => setCreateOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Icon className="mr-3 h-4 w-4 text-gray-500" />
                        {opt.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                    isActive(item.href)
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="flex-shrink-0 p-4 border-t bg-white">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-600 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-center pr-10">
            <Image src="/logo.png" alt="MaxVolt" width={120} height={40} className="object-contain" />
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
