'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDietPlans, deleteDietPlan } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Salad, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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
          <p className="text-sm text-muted mt-1">{Array.isArray(plans) ? plans.length : 0} total plans</p>
        </div>
        <Link href="/diet-plans/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors">
          <Plus className="w-4 h-4" /> Add Diet Plan
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Name', 'Category', 'Calories', 'Protein', 'Carbs', 'Fat', 'Meals', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.isArray(plans) && plans.length > 0 ? (
                  plans.map((plan: any) => (
                    <tr key={plan._id} className="hover:bg-card-hover transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-400/10 flex items-center justify-center">
                            <Salad className="w-4 h-4 text-orange-400" />
                          </div>
                          <span className="text-sm font-medium text-white">{plan.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted capitalize">{plan.category || '—'}</td>
                      <td className="px-5 py-4 text-sm text-muted">{plan.calories || 0} kcal</td>
                      <td className="px-5 py-4 text-sm text-blue-400">{plan.protein || 0}g</td>
                      <td className="px-5 py-4 text-sm text-amber-400">{plan.carbs || 0}g</td>
                      <td className="px-5 py-4 text-sm text-red-400">{plan.fat || 0}g</td>
                      <td className="px-5 py-4 text-sm text-muted">{plan.meals?.length || 0}</td>
                      <td className="px-5 py-4 text-sm text-muted">{plan.createdAt ? formatDate(plan.createdAt) : '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/diet-plans/${plan._id}/edit`} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => { if (confirm('Delete this diet plan?')) deleteMutation.mutate(plan._id); }} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-16 text-center text-muted text-sm">
                      <Salad className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No diet plans found. Create your first plan!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
