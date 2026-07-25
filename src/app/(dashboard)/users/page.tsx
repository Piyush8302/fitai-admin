'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, toggleUserPremium, deactivateUser, deleteUser } from '@/lib/api';
import { formatRelativeDate, getInitials } from '@/lib/utils';
import {
  Users,
  Search,
  Loader2,
  Crown,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
  Eye,
  Store,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// How a user is attached to a gym, shortened for the badge.
const ROLE_SHORT: Record<string, string> = { member: 'member', owner: 'owner', staff: 'staff' };

type UserType = '' | 'owner' | 'staff' | 'member' | 'app' | 'admin';
type UserStatus = '' | 'active' | 'inactive';
type UserPlan = '' | 'premium' | 'free';

const TYPE_TABS: { key: UserType; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'owner', label: 'Owners' },
  { key: 'staff', label: 'Staff' },
  { key: 'member', label: 'Members' },
  { key: 'app', label: 'App-only' },
  { key: 'admin', label: 'Admins' },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<UserType>('');
  const [statusF, setStatusF] = useState<UserStatus>('');
  const [planF, setPlanF] = useState<UserPlan>('');
  const [page, setPage] = useState(1);
  const limit = 15;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, type, statusF, planF, page],
    queryFn: () =>
      getUsers({
        search,
        page,
        limit,
        type: type || undefined,
        status: statusF || undefined,
        isPremium: planF === '' ? undefined : planF === 'premium',
      }),
  });

  const users = data?.users ?? data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const togglePremiumMutation = useMutation({
    mutationFn: toggleUserPremium,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User premium status updated');
    },
    onError: () => toast.error('Failed to update premium status'),
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deactivated');
    },
    onError: () => toast.error('Failed to deactivate user'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(res?.message || 'User deleted');
    },
    // The API refuses (409) while the user still owns a gym — show that reason.
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to delete user'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-muted mt-1">{total} total users</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type — the main filter (owner / staff / member / app-only / admin) */}
          <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
            {TYPE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setType(t.key); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  type === t.key ? 'bg-primary text-white' : 'text-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Plan */}
          <select
            value={planF}
            onChange={(e) => { setPlanF(e.target.value as UserPlan); setPage(1); }}
            className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All plans</option>
            <option value="premium">Premium</option>
            <option value="free">Free</option>
          </select>

          {/* Status */}
          <select
            value={statusF}
            onChange={(e) => { setStatusF(e.target.value as UserStatus); setPage(1); }}
            className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

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
                  {['User', 'Email', 'Gym', 'Status', 'Plan', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length > 0 ? (
                  users.map((user: any) => (
                    <tr key={user._id} className="hover:bg-card-hover transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                            {getInitials(user.name || 'U')}
                          </div>
                          <span className="text-sm font-medium text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{user.email}</td>
                      {/* Which gym(s) this person belongs to, and in what capacity */}
                      <td className="px-5 py-4">
                        {user.gyms?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {user.gyms.slice(0, 2).map((g: any) => (
                              <Link
                                key={`${g._id}-${g.as}`}
                                href={`/gyms/${g._id}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                title={`${g.name} · ${g.as}`}
                              >
                                <Store className="w-3 h-3 shrink-0" />
                                <span className="truncate max-w-[110px]">{g.name}</span>
                                <span className="opacity-60">· {ROLE_SHORT[g.as] || g.as}</span>
                              </Link>
                            ))}
                            {user.gyms.length > 2 && (
                              <span className="text-[11px] text-muted self-center">+{user.gyms.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted">— App only</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isPremium ? 'bg-amber-400/10 text-amber-400' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {user.isPremium ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{formatRelativeDate(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/users/${user._id}`} className="p-1.5 rounded-lg hover:bg-gray-700 text-muted hover:text-white transition-colors" title="View">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => togglePremiumMutation.mutate(user._id)} className="p-1.5 rounded-lg hover:bg-amber-400/10 text-muted hover:text-amber-400 transition-colors" title="Toggle Premium">
                            <Crown className="w-4 h-4" />
                          </button>
                          {user.isActive !== false && (
                            <button onClick={() => { if (confirm('Deactivate this user?')) deactivateMutation.mutate(user._id); }} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors" title="Deactivate">
                              <ShieldOff className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`Permanently delete ${user.name || 'this user'}?\n\nTheir account, gym memberships, tracking and notifications are removed for good. This cannot be undone.`)) {
                                deleteMutation.mutate(user._id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-muted text-sm">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <span className="text-sm text-muted">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-gray-800 text-muted hover:text-white disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg bg-gray-800 text-muted hover:text-white disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
