'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, toggleUserPremium, deactivateUser } from '@/lib/api';
import { formatDate, getInitials } from '@/lib/utils';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Crown,
  ShieldOff,
  Loader2,
  Mail,
  Calendar,
  Target,
  Activity,
  Ruler,
  Weight,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
  });

  const togglePremium = useMutation({
    mutationFn: () => toggleUserPremium(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      toast.success('Premium status toggled');
    },
  });

  const deactivate = useMutation({
    mutationFn: () => deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      toast.success('User deactivated');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-20">
        <p className="text-danger">User not found</p>
        <Link href="/users" className="text-primary text-sm mt-2 inline-block">Back to Users</Link>
      </div>
    );
  }

  const infoItems = [
    { label: 'Email', value: user.email, icon: Mail },
    { label: 'Gender', value: user.gender || '—', icon: UserIcon },
    { label: 'Age', value: user.age ? `${user.age} years` : '—', icon: Calendar },
    { label: 'Height', value: user.height ? `${user.height} cm` : '—', icon: Ruler },
    { label: 'Weight', value: user.weight ? `${user.weight} kg` : '—', icon: Weight },
    { label: 'Fitness Goal', value: user.fitnessGoal || '—', icon: Target },
    { label: 'Activity Level', value: user.activityLevel || '—', icon: Activity },
    { label: 'Joined', value: formatDate(user.createdAt), icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
              {getInitials(user.name || 'U')}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-muted">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}>
                  {user.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isPremium ? 'bg-amber-400/10 text-amber-400' : 'bg-gray-700 text-gray-300'
                }`}>
                  {user.isPremium ? '👑 Premium' : 'Free'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => togglePremium.mutate()} className="px-4 py-2 rounded-xl bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 text-sm font-medium transition-colors flex items-center gap-2">
              <Crown className="w-4 h-4" />
              {user.isPremium ? 'Remove Premium' : 'Make Premium'}
            </button>
            {user.isActive !== false && (
              <button onClick={() => { if (confirm('Deactivate this user?')) deactivate.mutate(); }} className="px-4 py-2 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 text-sm font-medium transition-colors flex items-center gap-2">
                <ShieldOff className="w-4 h-4" />
                Deactivate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {infoItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted uppercase tracking-wider">{item.label}</span>
              </div>
              <p className="text-sm font-medium text-white capitalize">{item.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
