'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkouts, deleteWorkout } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Dumbbell, Plus, Trash2, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function WorkoutsPage() {
  const queryClient = useQueryClient();

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ['workouts'],
    queryFn: getWorkouts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout deleted');
    },
    onError: () => toast.error('Failed to delete workout'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workouts</h1>
          <p className="text-sm text-muted mt-1">{Array.isArray(workouts) ? workouts.length : 0} total workouts</p>
        </div>
        <Link href="/workouts/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors">
          <Plus className="w-4 h-4" /> Add Workout
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
                  {['Name', 'Category', 'Difficulty', 'Duration', 'Calories', 'Exercises', 'Created', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.isArray(workouts) && workouts.length > 0 ? (
                  workouts.map((workout: any) => (
                    <tr key={workout._id} className="hover:bg-card-hover transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-400/10 flex items-center justify-center">
                            <Dumbbell className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-white">{workout.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted capitalize">{workout.category || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          workout.difficulty === 'beginner' ? 'bg-green-400/10 text-green-400' :
                          workout.difficulty === 'intermediate' ? 'bg-amber-400/10 text-amber-400' :
                          'bg-red-400/10 text-red-400'
                        }`}>
                          {workout.difficulty || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted">{workout.duration || 0} min</td>
                      <td className="px-5 py-4 text-sm text-muted">{workout.caloriesBurned || 0} kcal</td>
                      <td className="px-5 py-4 text-sm text-muted">{workout.exercises?.length || 0}</td>
                      <td className="px-5 py-4 text-sm text-muted">{workout.createdAt ? formatDate(workout.createdAt) : '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/workouts/${workout._id}/edit`} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors">
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button onClick={() => { if (confirm('Delete this workout?')) deleteMutation.mutate(workout._id); }} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted hover:text-danger transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-muted text-sm">
                      <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No workouts found. Create your first workout!
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
