'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getGyms } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Search, Store, MapPin, Users, Wallet, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ban } from 'lucide-react';

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

function GymsList() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  // Debounce the search box so we don't hit the API on every keystroke.
  React.useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['gyms', status, debounced, page],
    queryFn: () => getGyms({ status: status || undefined, search: debounced || undefined, page, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const gyms = data?.data || [];
  const pages = data?.pages || 1;

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
            <Link
              key={g._id}
              href={`/gyms/${g._id}`}
              className="bg-card border border-border rounded-2xl p-4 hover:border-primary/50 transition-colors flex flex-col gap-3"
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
