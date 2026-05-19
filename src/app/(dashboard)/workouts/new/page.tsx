'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createWorkout } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExerciseInput {
  name: string;
  sets: number;
  reps: number;
  restTime: number;
  muscleGroup: string;
  description: string;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('strength');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [duration, setDuration] = useState(30);
  const [caloriesBurned, setCaloriesBurned] = useState(200);
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { name: '', sets: 3, reps: 12, restTime: 60, muscleGroup: '', description: '' },
  ]);

  const mutation = useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      toast.success('Workout created!');
      router.push('/workouts');
    },
    onError: () => toast.error('Failed to create workout'),
  });

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: 3, reps: 12, restTime: 60, muscleGroup: '', description: '' }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof ExerciseInput, value: any) => {
    const updated = [...exercises];
    (updated[index] as any)[field] = value;
    setExercises(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Workout name is required');
    mutation.mutate({ name, description, category, difficulty, duration, caloriesBurned, exercises } as any);
  };

  const inputClass = 'w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Workouts
      </button>

      <h1 className="text-2xl font-bold text-white">Create Workout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. Upper Body Power" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[80px]`} placeholder="Workout description..." />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {['strength', 'cardio', 'hiit', 'yoga', 'stretching', 'functional', 'calisthenics'].map((c) => (
                  <option key={c} value={c} className="bg-gray-900">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className={inputClass}>
                {['beginner', 'intermediate', 'advanced'].map((d) => (
                  <option key={d} value={d} className="bg-gray-900">{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Duration (min)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Calories Burned</label>
              <input type="number" value={caloriesBurned} onChange={(e) => setCaloriesBurned(Number(e.target.value))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Exercises ({exercises.length})</h2>
            <button type="button" onClick={addExercise} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Exercise
            </button>
          </div>

          <div className="space-y-4">
            {exercises.map((ex, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-primary">Exercise {i + 1}</span>
                  {exercises.length > 1 && (
                    <button type="button" onClick={() => removeExercise(i)} className="p-1 text-muted hover:text-danger transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="col-span-2 md:col-span-3">
                    <input type="text" value={ex.name} onChange={(e) => updateExercise(i, 'name', e.target.value)} className={inputClass} placeholder="Exercise name" />
                  </div>
                  <input type="text" value={ex.muscleGroup} onChange={(e) => updateExercise(i, 'muscleGroup', e.target.value)} className={inputClass} placeholder="Muscle group" />
                  <div className="flex gap-2">
                    <input type="number" value={ex.sets} onChange={(e) => updateExercise(i, 'sets', Number(e.target.value))} className={inputClass} placeholder="Sets" />
                    <input type="number" value={ex.reps} onChange={(e) => updateExercise(i, 'reps', Number(e.target.value))} className={inputClass} placeholder="Reps" />
                  </div>
                  <input type="number" value={ex.restTime} onChange={(e) => updateExercise(i, 'restTime', Number(e.target.value))} className={inputClass} placeholder="Rest (sec)" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Create Workout
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
