'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getGyms, bulkGyms } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Search, Store, MapPin, Users, Wallet, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ban, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
  { key: 'requested', label: 'Requests' },
];

export default function GymsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}>
      <GymsList />
    </Suspense>
  );
}

const LOCATION_TABS = [
  { key: '', label: 'Any location' },
  { key: 'set', label: 'Location set' },
  { key: 'none', label: 'No location' },
];

function GymsList() {
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [location, setLocation] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  // Debounce the search box so we don't hit the API on every keystroke.
  React.useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['gyms', status, location, debounced, page],
    queryFn: () => getGyms({ status: status || undefined, location: (location || undefined) as 'set' | 'none' | undefined, search: debounced || undefined, page, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const gyms = data?.data || [];
  const pages = data?.pages || 1;

  // Selection resets whenever the visible list changes.
  React.useEffect(() => { setSelected(new Set()); }, [status, location, debounced, page]);
  const toggleOne = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const bulk = useMutation({
    mutationFn: ({ action, ids }: { action: 'suspend' | 'activate'; ids: string[] }) => bulkGyms(action, ids),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['gyms'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSelected(new Set());
      toast.success(res.message || 'Done');
    },
    onError: () => toast.error('Bulk action failed'),
  });

  return (
    <div className="space-y-4">
      {/* Search + status tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gym, city, code or owner…"
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/60"
          />
        </div>
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setStatus(t.key); setPage(1); }}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                status === t.key ? 'bg-primary text-white' : 'text-muted hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Location filter — find gyms that still need GPS set (can't do check-in) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
          {LOCATION_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setLocation(t.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location === t.key ? 'bg-primary text-white' : 'text-muted hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {gyms.length > 0 && (
          <button
            onClick={() =>
              setSelected((s) => (gyms.every((g) => s.has(g._id)) ? new Set() : new Set(gyms.map((g) => g._id))))
            }
            className="text-sm font-medium text-muted hover:text-white"
          >
            {gyms.every((g) => selected.has(g._id)) ? 'Clear selection' : 'Select all on page'}
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5">
          <span className="text-sm font-semibold text-white">{selected.size} selected</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`Suspend ${selected.size} selected gym(s)? They'll be disabled platform-wide.`))
                  bulk.mutate({ action: 'suspend', ids: [...selected] });
              }}
              disabled={bulk.isPending}
              className="rounded-lg bg-danger/15 px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/25 disabled:opacity-50"
            >
              <Ban className="mr-1 inline w-4 h-4" /> Suspend
            </button>
            <button
              onClick={() => bulk.mutate({ action: 'activate', ids: [...selected] })}
              disabled={bulk.isPending}
              className="rounded-lg bg-success/15 px-3 py-1.5 text-sm font-medium text-success hover:bg-success/25 disabled:opacity-50"
            >
              <CheckCircle2 className="mr-1 inline w-4 h-4" /> Activate
            </button>
            <button onClick={() => setSelected(new Set())} className="rounded-lg p-1.5 text-muted hover:text-white" title="Clear">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>
      ) : gyms.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted text-sm">
          No gyms found.
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 ${isFetching ? 'opacity-60' : ''}`}>
          {gyms.map((g) => (
            <div key={g._id} className="relative">
              {/* Checkbox is a sibling of the Link so clicking it never navigates */}
              <input
                type="checkbox"
                checked={selected.has(g._id)}
                onChange={() => toggleOne(g._id)}
                className="absolute top-3 right-3 z-10 h-4 w-4 accent-primary cursor-pointer"
                aria-label={`Select ${g.name}`}
              />
              <Link
                href={`/gyms/${g._id}`}
                className={`bg-card border rounded-2xl p-4 transition-colors flex flex-col gap-3 ${
                  selected.has(g._id) ? 'border-primary/60 ring-1 ring-primary/40' : 'border-border hover:border-primary/50'
                }`}
              >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Store className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold truncate">{g.name}</p>
                    <span className={`inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      g.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                    }`}>
                      {g.isActive ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {g.isActive ? 'Active' : 'Suspended'}
                    </span>
                    {!g.isActive && g.reactivationRequested && (
                      <span className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-400/15 text-amber-400">
                        Reactivation requested
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" /> {g.city || 'No city'} · {g.gymCode}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted truncate">
                Owner: <span className="text-gray-300">{g.owner?.name || '—'}</span>
                {g.owner?.phone ? ` · ${g.owner.phone}` : ''}
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-border">
                <span className="flex items-center gap-1.5 text-sm text-white">
                  <Users className="w-4 h-4 text-blue-400" /> {formatNumber(g.members)}
                  <span className="text-xs text-muted">members</span>
                </span>
                <span className="flex items-center gap-1.5 text-sm text-white">
                  <Wallet className="w-4 h-4 text-emerald-400" /> {formatCurrency(g.revenue, 'INR')}
                </span>
                {!g.hasLocation && (
                  <span className="ml-auto text-[11px] text-amber-400">No location set</span>
                )}
              </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg bg-card border border-border text-muted disabled:opacity-40 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted">Page {page} of {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="p-2 rounded-lg bg-card border border-border text-muted disabled:opacity-40 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
