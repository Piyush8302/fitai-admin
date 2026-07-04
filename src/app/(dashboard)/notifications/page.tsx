'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { sendNotification, sendDailyTip, getGyms } from '@/lib/api';
import { Bell, Send, Loader2, Zap, Info, AlertTriangle, Gift, Users, Crown, Building2, Store, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

type Audience = 'all' | 'premium' | 'gym_owners' | 'gym_members' | 'user';

export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'promo'>('info');
  const [audience, setAudience] = useState<Audience>('all');
  const [gymId, setGymId] = useState('');
  const [userId, setUserId] = useState('');

  // Gyms list for the "specific gym members" target.
  const { data: gymsData } = useQuery({
    queryKey: ['gyms-picker'],
    queryFn: () => getGyms({ limit: 100 }),
    enabled: audience === 'gym_members',
  });

  const sendMutation = useMutation({
    mutationFn: sendNotification,
    onSuccess: (res: any) => {
      toast.success(res?.message || 'Notification sent!');
      setTitle('');
      setMessage('');
    },
    onError: () => toast.error('Failed to send notification'),
  });

  const tipMutation = useMutation({
    mutationFn: sendDailyTip,
    onSuccess: () => toast.success('Daily tip sent to all users!'),
    onError: () => toast.error('Failed to send daily tip'),
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return toast.error('Title and message are required');
    if (audience === 'user') {
      if (!userId.trim()) return toast.error('Enter a user ID (or pick a different audience)');
      sendMutation.mutate({ userId, title, message, type } as any);
    } else if (audience === 'gym_members') {
      if (!gymId) return toast.error('Pick a gym');
      sendMutation.mutate({ targetAudience: 'gym_members', gymId, title, message, type } as any);
    } else {
      sendMutation.mutate({ targetAudience: audience, title, message, type } as any);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  const typeOptions = [
    { value: 'info', label: 'Info', icon: Info, color: 'text-blue-400' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-400' },
    { value: 'success', label: 'Success', icon: Zap, color: 'text-green-400' },
    { value: 'promo', label: 'Promo', icon: Gift, color: 'text-purple-400' },
  ];

  const audienceOptions: { value: Audience; label: string; icon: typeof Users }[] = [
    { value: 'all', label: 'All Users', icon: Users },
    { value: 'premium', label: 'Premium', icon: Crown },
    { value: 'gym_owners', label: 'Gym Owners', icon: Building2 },
    { value: 'gym_members', label: 'Gym Members', icon: Store },
    { value: 'user', label: 'Specific User', icon: UserIcon },
  ];

  const templates = [
    { title: 'Workout Reminder', message: "Don't forget your workout today! Stay consistent for best results. 💪" },
    { title: 'New Feature', message: 'Check out our new AI-powered meal planning feature! Get personalized diet plans. 🍽️' },
    { title: 'Weekly Challenge', message: 'New weekly challenge is live! Complete 5 workouts this week to earn a badge. 🏆' },
    { title: 'Hydration Reminder', message: 'Stay hydrated! Aim for 8 glasses of water today. Your body will thank you. 💧' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Notifications</h1>
          <p className="text-sm text-muted mt-1">Send push + in-app notifications to a chosen audience</p>
        </div>
        <button
          onClick={() => { if (confirm('Send a daily health tip to ALL users?')) tipMutation.mutate(); }}
          disabled={tipMutation.isPending}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {tipMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Send Daily Tip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSend} className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Compose Notification
            </h2>

            {/* Audience */}
            <div>
              <label className={labelClass}>Send to</label>
              <div className="flex flex-wrap gap-2">
                {audienceOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAudience(opt.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors border ${
                        audience === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-card-hover text-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional: gym picker or user id */}
            {audience === 'gym_members' && (
              <div>
                <label className={labelClass}>Gym *</label>
                <select value={gymId} onChange={(e) => setGymId(e.target.value)} className={inputClass}>
                  <option value="">Select a gym…</option>
                  {(gymsData?.data || []).map((g) => (
                    <option key={g._id} value={g._id}>{g.name} — {g.city || g.gymCode} ({g.members} members)</option>
                  ))}
                </select>
              </div>
            )}
            {audience === 'user' && (
              <div>
                <label className={labelClass}>User ID *</label>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className={inputClass} placeholder="Specific user ID" />
              </div>
            )}

            {/* Type */}
            <div>
              <label className={labelClass}>Notification Type</label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                        type === opt.value ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card hover:bg-card-hover text-muted'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${type === opt.value ? 'text-primary' : opt.color}`} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelClass}>Title *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Notification title" />
            </div>

            <div>
              <label className={labelClass}>Message *</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} min-h-[120px]`} placeholder="Notification message..." />
            </div>

            <button type="submit" disabled={sendMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50">
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Notification
            </button>
          </form>
        </div>

        {/* Templates */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Quick Templates</h2>
          {templates.map((tpl, i) => (
            <button
              key={i}
              onClick={() => { setTitle(tpl.title); setMessage(tpl.message); }}
              className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
            >
              <p className="text-sm font-medium text-white mb-1">{tpl.title}</p>
              <p className="text-xs text-muted line-clamp-2">{tpl.message}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
