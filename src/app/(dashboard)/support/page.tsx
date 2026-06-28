'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { getSupportMessages, resolveSupportMessage, deleteSupportMessage } from '@/lib/api';
import { LifeBuoy, Mail, Phone, Clock, Check, Trash2, RefreshCw, Building2 } from 'lucide-react';

interface SupportMsg {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  gymName?: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt?: string;
}

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'all', label: 'All' },
];

export default function SupportPage() {
  const [tab, setTab] = useState('open');
  const [rows, setRows] = useState<SupportMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSupportMessages(tab);
      setRows(res?.data || []);
    } catch (e) {
      setRows([]);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const resolve = async (id: string) => {
    setBusyId(id);
    try { await resolveSupportMessage(id); await load(); } catch { alert('Failed'); }
    setBusyId(null);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    setBusyId(id);
    try { await deleteSupportMessage(id); await load(); } catch { alert('Failed'); }
    setBusyId(null);
  };

  const roleLabel = (r?: string) =>
    r === 'gym_owner' ? 'Gym Owner' : r === 'gym_staff' ? 'Gym Staff' : 'User';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <LifeBuoy className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Support Messages</h1>
            <p className="text-sm text-gray-400">Contact Us messages from gym owners, staff & users</p>
          </div>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/60">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={'px-4 py-2 rounded-xl text-sm font-medium transition-all ' +
              (tab === t.key ? 'bg-primary/15 text-primary' : 'text-gray-400 hover:text-white hover:bg-gray-800/60')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-gray-400 text-sm py-16 text-center">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-gray-400 text-sm py-16 text-center">No {tab} messages.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((m) => (
            <div key={m._id} className="p-4 rounded-2xl bg-gray-900/60 border border-border">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-semibold">{m.name || 'User'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary">{roleLabel(m.role)}</span>
                    {m.gymName && (
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{m.gymName}</span>
                    )}
                    {m.status === 'resolved' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400">resolved</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                    {m.email && <a href={`mailto:${m.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="w-3.5 h-3.5" />{m.email}</a>}
                    {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="w-3.5 h-3.5" />{m.phone}</a>}
                    {m.createdAt && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(m.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.status !== 'resolved' && (
                    <button disabled={busyId === m._id} onClick={() => resolve(m._id)} title="Mark resolved"
                      className="p-2 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 disabled:opacity-50">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button disabled={busyId === m._id} onClick={() => remove(m._id)} title="Delete"
                    className="p-2 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 disabled:opacity-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-xl bg-gray-800/60 text-sm text-gray-200 whitespace-pre-wrap">{m.message}</div>
              {m.email && (
                <a href={`mailto:${m.email}?subject=Re: Your FitAI support request`}
                  className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline">
                  <Mail className="w-4 h-4" /> Reply by email
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
