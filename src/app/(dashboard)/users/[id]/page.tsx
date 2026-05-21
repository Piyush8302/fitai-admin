'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, toggleUserPremium, deactivateUser } from '@/lib/api';
import { formatDate, formatRelativeDate, getInitials } from '@/lib/utils';

const safeDateFormat = (d: any, pattern?: string) => {
  if (!d) return '---';
  try { return pattern ? formatDate(d, pattern) : formatDate(d); } catch { return '---'; }
};
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
  Phone,
  Flame,
  Zap,
  Dumbbell,
  Utensils,
  Heart,
  TrendingUp,
  Clock,
  CreditCard,
  MessageSquare,
  Footprints,
  Droplets,
  Bell,
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

  const subscriptions = user._subscriptions || [];
  const recentTracking = user._recentTracking || [];
  const totalWorkoutDays = user._totalWorkoutDays || 0;

  const goalLabels: Record<string, string> = {
    weight_loss: 'Lose Weight', weight_gain: 'Gain Weight', muscle_building: 'Build Muscle',
    fat_loss: 'Fat Loss', maintenance: 'Stay Fit', home_workout: 'Home Workout',
    gym_workout: 'Gym Workout', height_growth: 'Height Growth',
  };
  const activityLabels: Record<string, string> = {
    sedentary: 'Sedentary', lightly_active: 'Lightly Active', moderately_active: 'Moderate',
    very_active: 'Very Active', extra_active: 'Athlete',
  };
  const dietLabels: Record<string, string> = {
    veg: 'Vegetarian', non_veg: 'Non-Vegetarian', vegan: 'Vegan', eggetarian: 'Eggetarian',
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </button>

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
              {getInitials(user.name || 'U')}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
              <p className="text-sm text-muted">{user.email}</p>
              {user.phone && <p className="text-sm text-muted">{user.phone}</p>}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive !== false ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}>
                  {user.isActive !== false ? 'Active' : 'Inactive'}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isPremium ? 'bg-amber-400/10 text-amber-400' : 'bg-gray-700 text-gray-300'
                }`}>
                  {user.isPremium ? 'Premium' : 'Free'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                  {user.role}
                </span>
                {user.isProfileComplete && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                    Profile Complete
                  </span>
                )}
                {user.authProvider && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 capitalize">
                    {user.authProvider}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
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

      {/* Personal Info */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Email', value: user.email, icon: Mail },
            { label: 'Phone', value: user.phone || '---', icon: Phone },
            { label: 'Gender', value: user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : '---', icon: UserIcon },
            { label: 'Age', value: user.age ? `${user.age} years` : '---', icon: Calendar },
            { label: 'Height', value: user.height ? `${user.height} cm` : '---', icon: Ruler },
            { label: 'Weight', value: user.weight ? `${user.weight} kg` : '---', icon: Weight },
            { label: 'Target Weight', value: user.targetWeight ? `${user.targetWeight} kg` : '---', icon: Target },
            { label: 'Joined', value: safeDateFormat(user.createdAt), icon: Calendar },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-white">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Health & Fitness */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Health & Fitness</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'BMI', value: user.bmi ? Number(user.bmi).toFixed(1) : '---', icon: Heart, color: 'text-pink-400' },
            { label: 'BMR', value: user.bmr ? `${user.bmr} kcal` : '---', icon: Zap, color: 'text-yellow-400' },
            { label: 'Daily Calories (TDEE)', value: user.dailyCalories ? `${user.dailyCalories} kcal` : '---', icon: Flame, color: 'text-orange-400' },
            { label: 'Protein Need', value: user.proteinNeed ? `${user.proteinNeed}g` : '---', icon: Dumbbell, color: 'text-blue-400' },
            { label: 'Fitness Goal', value: goalLabels[user.fitnessGoal] || user.fitnessGoal || '---', icon: Target, color: 'text-green-400' },
            { label: 'Activity Level', value: activityLabels[user.activityLevel] || user.activityLevel || '---', icon: Activity, color: 'text-cyan-400' },
            { label: 'Diet Preference', value: dietLabels[user.dietPreference] || user.dietPreference || '---', icon: Utensils, color: 'text-emerald-400' },
            { label: 'Total Workout Days', value: totalWorkoutDays.toString(), icon: TrendingUp, color: 'text-purple-400' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs text-muted uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-white">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription & Chat */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Subscription & Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted uppercase tracking-wider">Plan</span>
            </div>
            <p className="text-sm font-medium text-white capitalize">{user.subscriptionPlan || 'Free'}</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted uppercase tracking-wider">Expiry</span>
            </div>
            <p className="text-sm font-medium text-white">
              {safeDateFormat(user.subscriptionExpiry)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-muted uppercase tracking-wider">Chat Today</span>
            </div>
            <p className="text-sm font-medium text-white">
              {user.dailyChatCount || 0} messages {user.lastChatDate ? `(${safeDateFormat(user.lastChatDate, 'dd MMM')})` : ''}
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-4 h-4 text-teal-400" />
              <span className="text-xs text-muted uppercase tracking-wider">Push Token</span>
            </div>
            <p className="text-sm font-medium text-white truncate" title={user.expoPushToken || user.fcmToken || ''}>
              {user.expoPushToken ? 'Expo' : user.fcmToken ? 'FCM' : '---'}
              {(user.expoPushToken || user.fcmToken) && (
                <span className="text-xs text-muted ml-1">...{(user.expoPushToken || user.fcmToken || '').slice(-12)}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription History */}
      {subscriptions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Subscription History</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Plan', 'Amount', 'Status', 'Payment ID', 'Start', 'End', 'Created'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-card-hover transition-colors">
                    <td className="px-4 py-3 text-sm text-white capitalize">{sub.plan}</td>
                    <td className="px-4 py-3 text-sm text-white">{sub.amount ? `${(sub.amount / 100).toFixed(0)}` : '---'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === 'active' ? 'bg-success/10 text-success'
                        : sub.status === 'cancelled' ? 'bg-danger/10 text-danger'
                        : sub.status === 'pending' ? 'bg-amber-400/10 text-amber-400'
                        : 'bg-gray-700 text-gray-400'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted font-mono">{sub.paymentId || '---'}</td>
                    <td className="px-4 py-3 text-sm text-muted">{safeDateFormat(sub.startDate)}</td>
                    <td className="px-4 py-3 text-sm text-muted">{safeDateFormat(sub.endDate)}</td>
                    <td className="px-4 py-3 text-sm text-muted">{safeDateFormat(sub.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Tracking */}
      {recentTracking.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Recent Activity (Last 14 days)</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Date', 'Calories', 'Protein', 'Steps', 'Water', 'Workout', 'Meals'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTracking.map((t: any) => (
                  <tr key={t._id} className="hover:bg-card-hover transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{safeDateFormat(t.date, 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-white">{t.caloriesConsumed || 0}</span>
                      <span className="text-muted text-xs"> / {t.caloriesGoal || '---'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-white">{t.proteinConsumed || 0}g</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{t.steps || 0}</td>
                    <td className="px-4 py-3 text-sm text-white">{t.waterIntake || 0} glasses</td>
                    <td className="px-4 py-3 text-sm">
                      {t.workoutCompleted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">
                          {t.workoutMinutes || 0} min
                        </span>
                      ) : (
                        <span className="text-muted text-xs">---</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{t.mealsLogged?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Meals Detail (latest day) */}
      {recentTracking.length > 0 && recentTracking[0]?.mealsLogged?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">Latest Meals ({safeDateFormat(recentTracking[0].date, 'dd MMM yyyy')})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTracking[0].mealsLogged.map((meal: any, i: number) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-primary uppercase font-medium">{meal.mealType || 'Meal'}</span>
                  <span className="text-xs text-muted">{meal.totalCalories || 0} kcal</span>
                </div>
                {meal.items && meal.items.length > 0 ? (
                  <div className="space-y-1">
                    {meal.items.map((item: any, j: number) => (
                      <div key={j} className="flex justify-between text-sm">
                        <span className="text-white">{item.name || 'Item'}</span>
                        <span className="text-muted text-xs">{item.calories || 0} kcal · {item.protein || 0}g P</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No items logged</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
