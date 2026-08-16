'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGymMonthly } from '@/lib/api';
import { formatCurrency, formatDate, getInitials } from '@/lib/utils';
import {
  Wallet, TrendingDown, PiggyBank, UserPlus, CalendarCheck,
  Loader2, ArrowUpRight, ArrowDownRight, Minus, AlertTriangle,
} from 'lucide-react';

// The gym page's other numbers are lifetime totals. This panel answers the
// question an admin actually asks — "how did this gym do THIS month, and is
// that better or worse than last month?" — and lets every figure be opened up
// into the rows it came from.

const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-IN', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  });
};

const thisMonthKey = () => {
  const ist = new Date(Date.now() + 5.5 * 3600 * 1000);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}`;
};

// A month-on-month change. `goodWhenUp` flips the colour for things like
// expenses, where a rise is not a win.
function Delta({ now, before, goodWhenUp = true }: { now: number; before: number; goodWhenUp?: boolean }) {
  if (!before && !now) return <span className="text-[11px] text-muted">no activity last month</span>;
  if (!before) return <span className="text-[11px] text-success">new this month</span>;
  const pct = Math.round(((now - before) / Math.abs(before)) * 100);
  const flat = pct === 0;
  const up = pct > 0;
  const good = flat ? null : up === goodWhenUp;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`text-[11px] inline-flex items-center gap-0.5 ${
      good === null ? 'text-muted' : good ? 'text-success' : 'text-danger'
    }`}>
      <Icon className="w-3 h-3" />
      {flat ? 'same as' : `${Math.abs(pct)}% vs`} last month
    </span>
  );
}

type Tab = 'payments' | 'joined' | 'expenses' | 'dues';

export default function MonthlyPanel({ gymId }: { gymId: string }) {
  const [month, setMonth] = React.useState(thisMonthKey());
  const [tab, setTab] = React.useState<Tab>('payments');

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['gym-monthly', gymId, month],
    queryFn: () => getGymMonthly(gymId, month),
    enabled: !!gymId,
    placeholderData: (prev) => prev,   // keep the old month on screen while the new one loads
  });

  const d = data?.data;
  const months = d?.months?.length ? d.months : [month];

  const isAllTime = d?.month.key === 'all-time';
  const cards = d ? [
    {
      label: 'Collected', value: formatCurrency(d.month.collection.total, 'INR'),
      sub: `${d.month.collection.count} payment${d.month.collection.count === 1 ? '' : 's'}`,
      icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10',
      delta: !isAllTime ? <Delta now={d.month.collection.total} before={d.prevMonth?.collection || 0} /> : null,
    },
    {
      label: 'Expenses', value: formatCurrency(d.month.cashbook.expense, 'INR'),
      sub: 'from the cashbook',
      icon: TrendingDown, color: 'text-danger', bg: 'bg-danger/10',
      delta: !isAllTime ? <Delta now={d.month.cashbook.expense} before={d.prevMonth?.expense || 0} goodWhenUp={false} /> : null,
    },
    {
      label: 'Net', value: formatCurrency(d.month.cashbook.net, 'INR'),
      sub: `income ${formatCurrency(d.month.cashbook.income, 'INR')}`,
      icon: PiggyBank, color: d.month.cashbook.net >= 0 ? 'text-emerald-400' : 'text-danger',
      bg: d.month.cashbook.net >= 0 ? 'bg-emerald-400/10' : 'bg-danger/10',
      delta: null,
    },
    {
      label: 'New members', value: String(d.month.members.joined),
      sub: isAllTime ? `${d.month.members.totalAtEnd} total` : `${d.month.members.totalAtEnd} total by month end`,
      icon: UserPlus, color: 'text-blue-400', bg: 'bg-blue-400/10',
      delta: !isAllTime ? <Delta now={d.month.members.joined} before={d.prevMonth?.joined || 0} /> : null,
    },
    {
      label: 'Check-ins', value: String(d.month.attendance.checkins),
      sub: `${d.month.attendance.uniqueMembers} member${d.month.attendance.uniqueMembers === 1 ? '' : 's'}${d.month.attendance.activeDays ? ` · ${d.month.attendance.activeDays} day${d.month.attendance.activeDays === 1 ? '' : 's'}` : ''}`,
      icon: CalendarCheck, color: 'text-amber-400', bg: 'bg-amber-400/10',
      delta: !isAllTime ? <Delta now={d.month.attendance.checkins} before={d.prevMonth?.checkins || 0} /> : null,
    },
  ] : [];

  const peak = d ? Math.max(1, ...d.month.attendance.daily.map((x) => x.checkins)) : 1;
  const unpaidDues = d ? d.dues.list.filter((x) => !x.paid) : [];

  const tabs: { id: Tab; label: string; count: number }[] = d ? [
    { id: 'payments', label: 'Payments', count: d.payments.length },
    { id: 'joined', label: 'New members', count: d.joinedMembers.length },
    { id: 'expenses', label: 'Expenses', count: d.expenses.length },
    ...(isAllTime ? [] : [{ id: 'dues', label: 'Fees due', count: d.dues.count }]),
  ] : [];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Monthly view</h2>
          <p className="text-xs text-muted mt-0.5">
            {d ? `${d.month.label} · everything this gym did that month` : 'Loading…'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && <Loader2 className="w-4 h-4 animate-spin text-muted" />}
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-primary"
          >
            {months.map((k) => (
              <option key={k} value={k}>
                {k === 'all-time' ? 'All time (since creation)' : `${monthLabel(k)}${k === thisMonthKey() ? ' (this month)' : ''}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading && !d ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error || !d ? (
        <p className="p-6 text-center text-sm text-danger">Could not load this month.</p>
      ) : (
        <>
          {/* Numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 p-4">
            {cards.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label} className="bg-background border border-border rounded-2xl p-3.5">
                  <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center mb-2.5`}>
                    <Icon className={`w-4 h-4 ${c.color}`} />
                  </div>
                  <p className="text-lg font-bold text-white leading-tight">{c.value}</p>
                  <p className="text-xs text-muted">{c.label} · {c.sub}</p>
                  {c.delta && <div className="mt-1">{c.delta}</div>}
                </div>
              );
            })}
          </div>

          {/* Daily check-ins — shows whether the gym is busy all month or only around fee day */}
          {!isAllTime && (
            <div className="px-4 pb-4">
              <div className="bg-background border border-border rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Check-ins per day</h3>
                  {d.month.attendance.busiestDay && (
                    <span className="text-[11px] text-muted">
                      busiest {formatDate(d.month.attendance.busiestDay.day, 'dd MMM')} · {d.month.attendance.busiestDay.checkins}
                    </span>
                  )}
                </div>
                {d.month.attendance.daily.length === 0 ? (
                  <p className="text-sm text-muted py-4 text-center">No check-ins this month</p>
                ) : (
                  <div className="flex items-end gap-1 h-28 overflow-x-auto">
                    {d.month.attendance.daily.map((x) => (
                      <div key={x.day} className="flex-1 min-w-[8px] flex flex-col items-center gap-1" title={`${x.day} · ${x.checkins} check-ins`}>
                        <div
                          className="w-full bg-primary/70 hover:bg-primary rounded-t transition-colors"
                          style={{ height: `${Math.max(4, (x.checkins / peak) * 100)}%` }}
                        />
                        <span className="text-[9px] text-muted">{x.day.slice(-2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unpaid dues get their own line — this is the number an owner is chased about */}
          {!isAllTime && unpaidDues.length > 0 && (
            <div className="mx-4 mb-4 bg-amber-400/10 border border-amber-400/30 rounded-2xl p-3.5 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-400">
                <span className="font-semibold">{unpaidDues.length} member{unpaidDues.length === 1 ? '' : 's'}</span> had fees due
                in {d.month.label} with no payment recorded that month
                {' '}— {formatCurrency(unpaidDues.reduce((s, x) => s + (x.fee || 0), 0), 'INR')} outstanding.
              </p>
            </div>
          )}

          {/* The rows behind the numbers */}
          <div className="border-t border-border">
            <div className="flex gap-1 p-3 overflow-x-auto">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    tab === t.id ? 'bg-primary text-white' : 'bg-background text-muted hover:text-white'
                  }`}
                >
                  {t.label} ({t.count})
                </button>
              ))}
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-border">
              {tab === 'payments' && (d.payments.length === 0
                ? <p className="p-6 text-center text-sm text-muted">No payments in {d.month.label}</p>
                : d.payments.map((p) => (
                  <div key={p._id} className="flex items-center gap-3 p-3 sm:px-4">
                    <div className="w-9 h-9 rounded-full bg-emerald-400/15 flex items-center justify-center text-emerald-400 text-xs font-semibold shrink-0">
                      {getInitials(p.user?.name || 'M')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{p.user?.name || 'Member'}</p>
                      <p className="text-xs text-muted truncate">
                        {p.user?.phone || ''} · {p.plan || 'plan'} · {p.method || 'cash'}
                        {p.note ? ` · ${p.note}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-emerald-400">{formatCurrency(p.amount, 'INR')}</p>
                      <p className="text-[11px] text-muted">{formatDate(p.paidDate, 'dd MMM')}</p>
                    </div>
                  </div>
                )))}

              {tab === 'joined' && (d.joinedMembers.length === 0
                ? <p className="p-6 text-center text-sm text-muted">Nobody joined in {d.month.label}</p>
                : d.joinedMembers.map((m) => (
                  <div key={m._id} className="flex items-center gap-3 p-3 sm:px-4">
                    <div className="w-9 h-9 rounded-full bg-blue-400/15 flex items-center justify-center text-blue-400 text-xs font-semibold shrink-0">
                      {getInitials(m.user?.name || 'M')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{m.user?.name || 'Member'}</p>
                      <p className="text-xs text-muted truncate">
                        {m.user?.phone || ''} · {m.plan}{m.fee ? ` · ₹${m.fee}` : ''} · via {m.registeredVia.replace('_', ' ')}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted shrink-0">{formatDate(m.joinDate, 'dd MMM')}</p>
                  </div>
                )))}

              {tab === 'expenses' && (d.expenses.length === 0
                ? <p className="p-6 text-center text-sm text-muted">No expenses recorded in {d.month.label}</p>
                : d.expenses.map((e) => (
                  <div key={e._id} className="flex items-center gap-3 p-3 sm:px-4">
                    <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                      <TrendingDown className="w-4 h-4 text-danger" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{e.description || 'Expense'}</p>
                      <p className="text-xs text-muted">{e.method || 'cash'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-danger">−{formatCurrency(e.amount, 'INR')}</p>
                      <p className="text-[11px] text-muted">{formatDate(e.date, 'dd MMM')}</p>
                    </div>
                  </div>
                )))}

              {tab === 'dues' && (d.dues.list.length === 0
                ? <p className="p-6 text-center text-sm text-muted">No fees fell due in {d.month.label}</p>
                : d.dues.list.map((x) => (
                  <div key={x._id} className="flex items-center gap-3 p-3 sm:px-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      x.paid ? 'bg-success/15 text-success' : 'bg-amber-400/15 text-amber-400'
                    }`}>
                      {getInitials(x.user?.name || 'M')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{x.user?.name || 'Member'}</p>
                      <p className="text-xs text-muted truncate">{x.user?.phone || ''} · {x.plan} · {x.status}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-semibold ${x.paid ? 'text-success' : 'text-amber-400'}`}>
                        {x.paid ? 'paid' : formatCurrency(x.fee || 0, 'INR')}
                      </p>
                      <p className="text-[11px] text-muted">due {x.dueDate ? formatDate(x.dueDate, 'dd MMM') : '—'}</p>
                    </div>
                  </div>
                )))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
