'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getUsers } from '@/lib/api';
import { formatNumber, formatCurrency } from '@/lib/utils';
import {
  Users,
  Crown,
  TrendingUp,
  DollarSign,
  Dumbbell,
  Salad,
  FileText,
  Loader2,
  Target,
  Activity,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', '', 1],
    queryFn: () => getUsers({ page: 1, limit: 100 }),
  });

  const users = usersData?.users ?? usersData?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate analytics from user data
  const goalDistribution = users.reduce((acc: Record<string, number>, u: any) => {
    const goal = u.fitnessGoal || 'Not Set';
    acc[goal] = (acc[goal] || 0) + 1;
    return acc;
  }, {});

  const activityDistribution = users.reduce((acc: Record<string, number>, u: any) => {
    const level = u.activityLevel || 'Not Set';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const genderDistribution = users.reduce((acc: Record<string, number>, u: any) => {
    const gender = u.gender || 'Not Set';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {});

  const premiumRate = stats ? ((stats.premiumUsers / Math.max(stats.totalUsers, 1)) * 100).toFixed(1) : '0';

  const kpis = [
    { label: 'Total Users', value: formatNumber(stats?.totalUsers ?? 0), icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Premium Users', value: formatNumber(stats?.premiumUsers ?? 0), icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Conversion Rate', value: `${premiumRate}%`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue ?? 0), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Workouts', value: formatNumber(stats?.totalWorkouts ?? 0), icon: Dumbbell, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Diet Plans', value: formatNumber(stats?.totalDietPlans ?? 0), icon: Salad, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Articles', value: formatNumber(stats?.totalArticles ?? 0), icon: FileText, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { label: 'Free Users', value: formatNumber(stats?.freeUsers ?? 0), icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  ];

  const DistributionCard = ({ title, icon: Icon, data, colorMap }: { title: string; icon: any; data: Record<string, number>; colorMap: Record<string, string> }) => {
    const total = Object.values(data).reduce((sum, v) => sum + v, 0) || 1;
    return (
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Icon className="w-4 h-4 text-primary" /> {title}
        </h3>
        <div className="space-y-3">
          {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, count]) => {
            const pct = ((count / total) * 100).toFixed(0);
            const color = colorMap[key] || 'bg-gray-500';
            return (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-muted">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const goalColors: Record<string, string> = {
    weight_loss: 'bg-red-400', weight_gain: 'bg-blue-400', muscle_building: 'bg-purple-400',
    maintain: 'bg-green-400', height_growth: 'bg-amber-400', 'Not Set': 'bg-gray-500',
    general_fitness: 'bg-cyan-400', flexibility: 'bg-pink-400',
  };

  const activityColors: Record<string, string> = {
    sedentary: 'bg-red-400', lightly_active: 'bg-amber-400', moderately_active: 'bg-green-400',
    very_active: 'bg-blue-400', extra_active: 'bg-purple-400', 'Not Set': 'bg-gray-500',
  };

  const genderColors: Record<string, string> = {
    male: 'bg-blue-400', female: 'bg-pink-400', other: 'bg-purple-400', 'Not Set': 'bg-gray-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-muted mt-1">Overview of your platform performance</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card border border-border rounded-2xl p-5 hover:border-border-light transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted">{kpi.label}</span>
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{kpi.value}</p>
            </div>
          );
        })}
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DistributionCard title="Fitness Goals" icon={Target} data={goalDistribution} colorMap={goalColors} />
        <DistributionCard title="Activity Levels" icon={Activity} data={activityDistribution} colorMap={activityColors} />
        <DistributionCard title="Gender Distribution" icon={Users} data={genderDistribution} colorMap={genderColors} />
      </div>

      {/* Premium vs Free */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Premium vs Free Users</h3>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="h-8 bg-gray-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-amber-400 rounded-l-full flex items-center justify-center text-xs font-bold text-gray-900 min-w-[40px]" style={{ width: `${premiumRate}%` }}>
                {premiumRate}%
              </div>
              <div className="h-full bg-gray-600 rounded-r-full flex-1 flex items-center justify-center text-xs font-medium text-gray-300">
                {(100 - Number(premiumRate)).toFixed(1)}%
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-gray-300">Premium ({stats?.premiumUsers ?? 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-600" />
              <span className="text-gray-300">Free ({stats?.freeUsers ?? 0})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
