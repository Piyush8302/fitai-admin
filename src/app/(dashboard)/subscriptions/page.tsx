'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSubscriptions } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CreditCard, Loader2 } from 'lucide-react';

export default function SubscriptionsPage() {
  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success',
    cancelled: 'bg-danger/10 text-danger',
    expired: 'bg-gray-700 text-gray-300',
    pending: 'bg-warning/10 text-warning',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
        <p className="text-sm text-muted mt-1">{Array.isArray(subscriptions) ? subscriptions.length : 0} total subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active', count: Array.isArray(subscriptions) ? subscriptions.filter((s: any) => s.status === 'active').length : 0, color: 'text-success' },
          { label: 'Cancelled', count: Array.isArray(subscriptions) ? subscriptions.filter((s: any) => s.status === 'cancelled').length : 0, color: 'text-danger' },
          { label: 'Total Revenue', count: formatCurrency(Array.isArray(subscriptions) ? subscriptions.reduce((sum: number, s: any) => sum + (s.amount || 0), 0) : 0), color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <span className="text-sm text-muted">{stat.label}</span>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
          </div>
        ))}
      </div>

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
                  {['User', 'Plan', 'Amount', 'Status', 'Start Date', 'End Date', 'Payment'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.isArray(subscriptions) && subscriptions.length > 0 ? (
                  subscriptions.map((sub: any) => (
                    <tr key={sub._id} className="hover:bg-card-hover transition-colors">
                      <td className="px-5 py-4 text-sm text-white">
                        {typeof sub.userId === 'object' ? sub.userId?.name || sub.userId?.email : sub.userId || '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-muted capitalize">{sub.plan || '—'}</td>
                      <td className="px-5 py-4 text-sm font-medium text-emerald-400">{formatCurrency(sub.amount || 0)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[sub.status] || 'bg-gray-700 text-gray-300'}`}>
                          {sub.status || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{sub.startDate ? formatDate(sub.startDate) : '—'}</td>
                      <td className="px-5 py-4 text-sm text-muted">{sub.endDate ? formatDate(sub.endDate) : '—'}</td>
                      <td className="px-5 py-4 text-sm text-muted capitalize">{sub.paymentMethod || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-muted text-sm">
                      <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No subscriptions found
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
