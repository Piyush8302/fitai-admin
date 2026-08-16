'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGymDetail, toggleGymActive, deleteGym } from '@/lib/api';
import MonthlyPanel from './MonthlyPanel';
import { formatCurrency, formatNumber, formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Store, MapPin, Phone, Users, Wallet, UserCheck,
  CalendarCheck, Loader2, CheckCircle2, Ban, Clock, Trash2,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success',
  blocked: 'bg-danger/10 text-danger',
  left: 'bg-gray-700 text-gray-300',
  inactive: 'bg-amber-400/10 text-amber-400',
  expired: 'bg-amber-400/10 text-amber-400',
  frozen: 'bg-blue-400/10 text-blue-400',
};

export default function GymDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['gym', id],
    queryFn: () => getGymDetail(id),
    enabled: !!id,
  });

  const toggle = useMutation({
    mutationFn: () => toggleGymActive(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Updated');
      qc.invalidateQueries({ queryKey: ['gym', id] });
      qc.invalidateQueries({ queryKey: ['gyms'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: () => toast.error('Failed to update gym'),
  });

  const remove = useMutation({
    mutationFn: () => deleteGym(id),
    onSuccess: (res: { message?: string }) => {
      toast.success(res.message || 'Gym deleted');
      qc.invalidateQueries({ queryKey: ['gyms'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      router.push('/gyms');
    },
    onError: () => toast.error('Failed to delete gym'),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>;
  if (error || !data?.data) return <div className="bg-danger/10 border border-danger/30 rounded-2xl p-6 text-center text-danger">Gym not found.</div>;

  const { gym, owner, stats, staff, members } = data.data;

  const statCards = [
    { label: 'Members', value: formatNumber(stats.totalMembers), sub: `${stats.activeMembers} active`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Revenue', value: formatCurrency(stats.revenue, 'INR'), sub: `${stats.payments} payments`, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Staff', value: formatNumber(stats.staffCount), sub: 'members', icon: UserCheck, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Check-ins', value: formatNumber(stats.checkinsToday), sub: 'today', icon: CalendarCheck, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  return (
    <div className="space-y-5">
      <Link href="/gyms" className="inline-flex items-center gap-2 text-sm text-muted hover:text-white">
        <ArrowLeft className="w-4 h-4" /> Back to gyms
      </Link>

      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <Store className="w-7 h-7 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <h1 className="text-xl font-bold text-white">{gym.name}</h1>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
              gym.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
            }`}>
              {gym.isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
              {gym.isActive ? 'Active' : 'Suspended'}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {gym.city || 'No city'} · {gym.gymCode}</span>
            {gym.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {gym.phone}</span>}
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {gym.hasLocation ? 'Location set' : 'No location'}</span>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm(gym.isActive ? 'Suspend this gym? It will be disabled platform-wide.' : 'Re-activate this gym?')) toggle.mutate();
            }}
            disabled={toggle.isPending}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              gym.isActive ? 'bg-danger/15 text-danger hover:bg-danger/25' : 'bg-success/15 text-success hover:bg-success/25'
            }`}
          >
            {toggle.isPending ? '…' : gym.isActive ? 'Suspend gym' : (gym.reactivationRequested ? 'Approve & activate' : 'Activate gym')}
          </button>
          {/* Permanent wipe — ask for the gym's name so it can't happen on a stray click */}
          <button
            onClick={() => {
              const warning =
                `Permanently DELETE "${gym.name}"?\n\n` +
                `This also removes ${stats.totalMembers} membership(s), ${stats.payments} payment record(s), ` +
                `its cashbook and all attendance. Staff go back to being ordinary users.\n\n` +
                `Member and staff ACCOUNTS are kept. This cannot be undone.`;
              if (!confirm(warning)) return;
              const typed = prompt(`Type the gym name to confirm:\n${gym.name}`);
              if (typed === null) return;
              if (typed.trim() !== gym.name.trim()) return toast.error('Name did not match — nothing deleted');
              remove.mutate();
            }}
            disabled={remove.isPending}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-danger text-white hover:bg-danger/85 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {remove.isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Reactivation request highlight */}
      {!gym.isActive && gym.reactivationRequested && (
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-400">Reactivation requested by owner</p>
            <p className="text-xs text-muted mt-0.5">
              {gym.reactivationNote ? `“${gym.reactivationNote}”` : 'The owner has asked to reactivate this gym.'} Use “Approve & activate” above to un-suspend it.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-card border border-border rounded-2xl p-4">
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <p className="text-xl font-bold text-white leading-tight">{c.value}</p>
              <span className="text-xs text-muted">{c.label} · {c.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Month by month — the cards above are lifetime totals, this is "how is it doing now" */}
      <MonthlyPanel gymId={id} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Owner + staff */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Owner</h2>
            {owner ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
                  {getInitials(owner.name || 'O')}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{owner.name || '—'}</p>
                  <p className="text-xs text-muted truncate">{owner.phone || owner.email || ''}</p>
                </div>
              </div>
            ) : <p className="text-sm text-muted">No owner linked</p>}
          </div>

          <div className="bg-card border border-border rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Staff ({staff.length})</h2>
            {staff.length === 0 ? (
              <p className="text-sm text-muted">No staff added</p>
            ) : (
              <div className="space-y-2">
                {staff.map((s) => (
                  <div key={s._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-200 text-xs font-semibold">
                      {getInitials(s.name || 'S')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{s.name || '—'}</p>
                      <p className="text-xs text-muted truncate">{s.staffRole || 'Staff'} · {s.phone || ''}</p>
                    </div>
                    {s.staffStatus && s.staffStatus !== 'active' && (
                      <span className="text-[10px] text-danger">{s.staffStatus}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Members */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Members ({members.length} shown)</h2>
          </div>
          {members.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">No members yet</p>
          ) : (
            <div className="divide-y divide-border max-h-[520px] overflow-y-auto">
              {members.map((m) => (
                <div key={m._id} className="flex items-center gap-3 p-3 sm:px-4">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                    {getInitials(m.user?.name || 'M')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{m.user?.name || 'Member'}</p>
                    <p className="text-xs text-muted truncate">
                      {m.user?.phone || ''} · {m.plan}{m.fee ? ` · ₹${m.fee}` : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[m.status] || 'bg-gray-700 text-gray-300'}`}>
                      {m.status}
                    </span>
                    {m.dueDate && (
                      <p className="text-[11px] text-muted mt-0.5">due {formatDate(m.dueDate, 'dd MMM')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
