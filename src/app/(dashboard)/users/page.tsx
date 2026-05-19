'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, toggleUserPremium, deactivateUser } from '@/lib/api';
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
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', search, page],
    queryFn: () => getUsers({ search, page, limit }),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-sm text-muted mt-1">{total} total users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors"
        />
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
                  {['User', 'Email', 'Goal', 'Status', 'Plan', 'Joined', 'Actions'].map((h) => (
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
                      <td className="px-5 py-4 text-sm text-muted capitalize">{user.fitnessGoal || '—'}</td>
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
