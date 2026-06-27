'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { getOwnerRequests, approveOwnerRequest, rejectOwnerRequest } from '@/lib/api';
import { Building2, Check, X, Mail, Phone, Clock, RefreshCw } from 'lucide-react';

interface OwnerRequest {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  requestedGymName?: string;
  ownerStatus: 'pending' | 'approved' | 'rejected';
  ownerRequestedAt?: string;
}

const TABS: { key: string; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function GymOwnersPage() {
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState<OwnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOwnerRequests(tab);
      setRows(res?.data || []);
    } catch (e) {
      setRows([]);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const approve = async (id: string) => {
    if (!confirm('Approve this gym owner? A login OTP will be emailed to them.')) return;
    setBusyId(id);
    try {
      await approveOwnerRequest(id);
      await load();
    } catch (e) {
      alert('Failed to approve');
    }
    setBusyId(null);
  };

  const reject = async (id: string) => {
    if (!confirm('Reject this request?')) return;
    setBusyId(id);
    try {
      await rejectOwnerRequest(id);
      await load();
    } catch (e) {
      alert('Failed to reject');
    }
    setBusyId(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Gym Owner Requests</h1>
            <p className="text-sm text-gray-400">Approve or reject gym owner registrations</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/60"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              'px-4 py-2 rounded-xl text-sm font-medium transition-all ' +
              (tab === t.key ? 'bg-primary/15 text-primary' : 'text-gray-400 hover:text-white hover:bg-gray-800/60')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-16 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-400 text-sm py-16 text-center">No {tab} requests.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div
              key={r._id}
              className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-gray-900/60 border border-border"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold truncate">{r.requestedGymName || 'Gym'}</span>
                  <span className="text-xs text-gray-500">• {r.name || 'Owner'}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{r.phone || '—'}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{r.email || '—'}</span>
                  {r.ownerRequestedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(r.ownerRequestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              {r.ownerStatus === 'pending' ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={busyId === r._id}
                    onClick={() => approve(r._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-green-500/15 text-green-400 hover:bg-green-500/25 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    disabled={busyId === r._id}
                    onClick={() => reject(r._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              ) : (
                <span
                  className={
                    'px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ' +
                    (r.ownerStatus === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400')
                  }
                >
                  {r.ownerStatus}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
