'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubscriptions } from '@/lib/api';
import { formatDate, formatRelativeDate, getInitials } from '@/lib/utils';
import {
  CreditCard,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  IndianRupee,
  Mail,
  Phone,
  Eye,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

const STATUS_TABS = [
  { key: '', label: 'All', icon: Filter },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'active', label: 'Active', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
  { key: 'expired', label: 'Expired', icon: AlertTriangle },
];

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  expired: 'bg-gray-700/50 text-gray-400 border-gray-600',
};

export default function SubscriptionsPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['subscriptions', statusFilter],
    queryFn: () => getSubscriptions(statusFilter ? { status: statusFilter } : {}),
  });

  const subscriptions = response?.data || [];
  const stats = response?.stats || { all: 0, pending: 0, active: 0, cancelled: 0, expired: 0, totalRevenue: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-muted mt-1">Track all payment attempts & subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <span className="text-xs text-muted">Total</span>
          <p className="text-2xl font-bold text-white mt-1">{stats.all}</p>
        </div>
        <div className="bg-card border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-amber-400">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</p>
          {stats.pending > 0 && (
            <p className="text-[10px] text-amber-400/60 mt-0.5">Payment initiated, not completed</p>
          )}
        </div>
        <div className="bg-card border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400">Active</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
        </div>
        <div className="bg-card border border-red-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400">Cancelled</span>
          </div>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.cancelled}</p>
        </div>
        <div className="bg-card border border-emerald-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-emerald-400">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.totalRevenue ? `${(stats.totalRevenue / 100).toLocaleString('en-IN')}` : '0'}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-card border border-border text-muted hover:text-white hover:border-primary/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.key === 'pending' && stats.pending > 0 && (
                <span className="ml-1 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {stats.pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Pending Alert Banner */}
      {stats.pending > 0 && statusFilter === '' && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-400">
              {stats.pending} payment{stats.pending > 1 ? 's' : ''} initiated but not completed
            </p>
            <p className="text-xs text-amber-400/60 mt-1">
              These users started the checkout process but didn&apos;t finish. Click &quot;Pending&quot; tab to filter and follow up.
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['User', 'Contact', 'Plan', 'Amount', 'Status', 'Order ID', 'Payment ID', 'Initiated', 'Start', 'End'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.length > 0 ? (
                  subscriptions.map((sub: any) => {
                    const user = sub.user || {};
                    const isPending = sub.status === 'pending';
                    return (
                      <tr key={sub._id} className={`hover:bg-card-hover transition-colors ${isPending ? 'bg-amber-500/[0.02]' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                              {getInitials(user.name || 'U')}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/users/${user._id || sub.user}`} className="text-sm font-medium text-white hover:text-primary transition-colors truncate block">
                                {user.name || 'Unknown'}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-0.5">
                            {user.email && (
                              <a href={`mailto:${user.email}`} className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[140px]">{user.email}</span>
                              </a>
                            )}
                            {user.phone && (
                              <a href={`tel:${user.phone}`} className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white capitalize font-medium">{sub.plan}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-white">{sub.amount ? `${(sub.amount / 100).toFixed(0)}` : '---'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusStyles[sub.status] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                            {sub.status === 'pending' && <Clock className="w-3 h-3" />}
                            {sub.status === 'active' && <CheckCircle className="w-3 h-3" />}
                            {sub.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted font-mono truncate max-w-[120px]" title={sub.orderId}>{sub.orderId || '---'}</td>
                        <td className="px-4 py-3 text-xs font-mono truncate max-w-[120px]" title={sub.paymentId}>
                          {sub.paymentId ? (
                            <span className="text-emerald-400">{sub.paymentId}</span>
                          ) : (
                            <span className="text-amber-400/60">---</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-muted">{formatRelativeDate(sub.createdAt)}</div>
                          <div className="text-[10px] text-muted/60">{formatDate(sub.createdAt, 'dd MMM yyyy HH:mm')}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted">{sub.startDate ? formatDate(sub.startDate, 'dd MMM yyyy') : '---'}</td>
                        <td className="px-4 py-3 text-xs text-muted">{sub.endDate ? formatDate(sub.endDate, 'dd MMM yyyy') : '---'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-5 py-16 text-center text-muted text-sm">
                      <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      {statusFilter ? `No ${statusFilter} subscriptions` : 'No subscriptions found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
