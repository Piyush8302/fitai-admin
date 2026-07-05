'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api';
import { formatCurrency, formatNumber, formatRelativeDate, getInitials } from '@/lib/utils';
import {
  Users,
  Crown,
  CreditCard,
  DollarSign,
  Dumbbell,
  Salad,
  FileText,
  Loader2,
  TrendingUp,
  Store,
  UserCheck,
  Wallet,
  Clock,
  Ban,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 text-center">
        <p className="text-danger">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: formatNumber(stats?.totalUsers ?? 0),
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Premium Users',
      value: formatNumber(stats?.premiumUsers ?? 0),
      icon: Crown,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Active Subscriptions',
      value: formatNumber(stats?.activeSubscriptions ?? 0),
      icon: CreditCard,
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue ?? 0, 'INR'),
      icon: DollarSign,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Total Workouts',
      value: formatNumber(stats?.totalWorkouts ?? 0),
      icon: Dumbbell,
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
    },
    {
      label: 'Diet Plans',
      value: formatNumber(stats?.totalDietPlans ?? 0),
      icon: Salad,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
    },
    {
      label: 'Articles',
      value: formatNumber(stats?.totalArticles ?? 0),
      icon: FileText,
      color: 'text-pink-400',
      bg: 'bg-pink-400/10',
    },
    {
      label: 'Free Users',
      value: formatNumber(stats?.freeUsers ?? 0),
      icon: TrendingUp,
      color: 'text-cyan-400',
      bg: 'bg-cyan-400/10',
    },
  ];

  // Gym platform KPIs (clickable — open the gyms / owner-requests pages).
  const gymCards = [
    { label: 'Total Gyms', value: formatNumber(stats?.totalGyms ?? 0), icon: Store, color: 'text-primary', bg: 'bg-primary/10', href: '/gyms' },
    { label: 'Active Gyms', value: formatNumber(stats?.activeGyms ?? 0), icon: UserCheck, color: 'text-green-400', bg: 'bg-green-400/10', href: '/gyms?status=active' },
    { label: 'Suspended', value: formatNumber(stats?.suspendedGyms ?? 0), icon: Ban, color: 'text-red-400', bg: 'bg-red-400/10', href: '/gyms?status=suspended' },
    { label: 'Gym Members', value: formatNumber(stats?.totalGymMembers ?? 0), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', href: '/gyms' },
    { label: 'Gym Revenue', value: formatCurrency(stats?.gymRevenue ?? 0, 'INR'), icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10', href: '/gyms' },
    { label: 'Pending Requests', value: formatNumber(stats?.pendingOwnerRequests ?? 0), icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10', href: '/gym-owners' },
  ];

  return (
    <div className="space-y-6">
      {/* Gym platform KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Gym Platform</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {gymCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-card border border-border rounded-2xl p-4 hover:border-primary/50 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-xl font-bold text-white leading-tight">{card.value}</p>
                <span className="text-xs text-muted">{card.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* App / content KPIs */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">App & Content</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 hover:border-border-light transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs sm:text-sm text-muted">{card.label}</span>
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{card.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-white">Recent Users</h2>
          <Link
            href="/users"
            className="text-sm text-primary hover:text-primary-hover transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  User
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Plan
                </th>
                <th className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-card-hover transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                          {getInitials(user.name)}
                        </div>
                        <Link
                          href={`/users/${user._id}`}
                          className="text-sm font-medium text-white hover:text-primary transition-colors"
                        >
                          {user.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">{user.email}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive !== false
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isPremium
                            ? 'bg-amber-400/10 text-amber-400'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        {user.isPremium ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted">
                      {formatRelativeDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted text-sm">
                    No recent users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
