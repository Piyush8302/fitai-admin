'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDietPlans, deleteDietPlan } from '@/lib/api';
import { Salad, Plus, Trash2, Edit, Loader2, Flame, Dumbbell, Droplets, Crown } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const goalLabels: Record<string, string> = {
  weight_loss: 'Weight Loss', weight_gain: 'Weight Gain', muscle_building: 'Muscle Building',
  maintenance: 'Maintenance', keto: 'Keto', intermittent_fasting: 'IF',
};

const dietLabels: Record<string, string> = {
  veg: 'Veg', non_veg: 'Non-Veg', vegan: 'Vegan', eggetarian: 'Egg',
};

const goalColors: Record<string, string> = {
  weight_loss: 'text-green-400 bg-green-400/10', weight_gain: 'text-blue-400 bg-blue-400/10',
  muscle_building: 'text-purple-400 bg-purple-400/10', maintenance: 'text-gray-400 bg-gray-400/10',
  keto: 'text-orange-400 bg-orange-400/10', intermittent_fasting: 'text-amber-400 bg-amber-400/10',
};

export default function DietPlansPage() {
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['dietPlans'],
    queryFn: getDietPlans,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDietPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietPlans'] });
      toast.success('Diet plan deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Diet Plans</h1>
          <p className="text-sm text-muted mt-1">{Array.isArray(plans) ? plans.length : 0} plans</p>
        </div>
        <Link href="/diet-plans/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors">
          <Plus className="w-4 h-4" /> Add Plan
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : Array.isArray(plans) && plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan: any) => {
            const goalKey = plan.goal || plan.category || '';
            return (
              <div key={plan._id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-orange-400/10 flex items-center justify-center">
                      <Salad className="w-4.5 h-4.5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white leading-tight">{plan.title || plan.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${goalColors[goalKey] || 'text-gray-400 bg-gray-400/10'}`}>
                          {goalLabels[goalKey] || goalKey || '—'}
                        </span>
                        {plan.dietType && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium text-emerald-400 bg-emerald-400/10">
                            {dietLabels[plan.dietType] || plan.dietType}
                          </span>
                        )}
                        {plan.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/diet-plans/${plan._id}/edit`} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(plan._id); }} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {plan.description && (
                  <p className="text-xs text-muted mb-3 line-clamp-2">{plan.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    <span className="text-white font-medium">{plan.totalCalories || plan.calories || 0}</span>
                    <span className="text-muted">kcal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="w-3 h-3 text-blue-400" />
                    <span className="text-white font-medium">{plan.totalProtein || plan.protein || 0}g</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-cyan-400" />
                    <span className="text-white font-medium">{plan.waterIntake || 3}L</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-muted">{plan.meals?.length || 0} meals</span>
                  {plan.dayOfWeek && plan.dayOfWeek !== 'any' && (
                    <span className="text-[10px] text-muted capitalize">{plan.dayOfWeek}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl py-16 text-center">
          <Salad className="w-10 h-10 mx-auto mb-3 text-muted opacity-40" />
          <p className="text-sm text-muted">No diet plans yet. Create your first plan!</p>
        </div>
      )}
    </div>
  );
}
