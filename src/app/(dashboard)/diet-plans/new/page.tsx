'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createDietPlan } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface MealInput {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  foods: { name: string; quantity: number; unit: string; calories: number; protein: number; carbs: number; fat: number }[];
}

export default function NewDietPlanPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('weight_loss');
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(100);
  const [carbs, setCarbs] = useState(250);
  const [fat, setFat] = useState(65);
  const [meals, setMeals] = useState<MealInput[]>([
    { name: 'Breakfast', type: 'breakfast', calories: 400, foods: [{ name: '', quantity: 1, unit: 'serving', calories: 0, protein: 0, carbs: 0, fat: 0 }] },
  ]);

  const mutation = useMutation({
    mutationFn: createDietPlan,
    onSuccess: () => { toast.success('Diet plan created!'); router.push('/diet-plans'); },
    onError: () => toast.error('Failed to create diet plan'),
  });

  const addMeal = () => {
    const types: MealInput['type'][] = ['breakfast', 'lunch', 'dinner', 'snack'];
    const nextType = types[meals.length % 4];
    setMeals([...meals, { name: nextType.charAt(0).toUpperCase() + nextType.slice(1), type: nextType, calories: 400, foods: [{ name: '', quantity: 1, unit: 'serving', calories: 0, protein: 0, carbs: 0, fat: 0 }] }]);
  };

  const removeMeal = (i: number) => setMeals(meals.filter((_, idx) => idx !== i));

  const addFood = (mealIdx: number) => {
    const updated = [...meals];
    updated[mealIdx].foods.push({ name: '', quantity: 1, unit: 'serving', calories: 0, protein: 0, carbs: 0, fat: 0 });
    setMeals(updated);
  };

  const removeFood = (mealIdx: number, foodIdx: number) => {
    const updated = [...meals];
    updated[mealIdx].foods = updated[mealIdx].foods.filter((_, i) => i !== foodIdx);
    setMeals(updated);
  };

  const updateFood = (mealIdx: number, foodIdx: number, field: string, value: any) => {
    const updated = [...meals];
    (updated[mealIdx].foods[foodIdx] as any)[field] = value;
    setMeals(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    mutation.mutate({ name, description, category, calories, protein, carbs, fat, meals } as any);
  };

  const inputClass = 'w-full px-3 py-2 bg-card border border-border rounded-lg text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1';

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-white">Create Diet Plan</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Plan Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="e.g. High Protein Weight Loss Plan" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[60px]`} placeholder="Plan description..." />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {['weight_loss', 'weight_gain', 'muscle_building', 'maintain', 'keto', 'vegan', 'vegetarian', 'indian'].map((c) => (
                  <option key={c} value={c} className="bg-gray-900">{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Total Calories</label>
              <input type="number" value={calories} onChange={(e) => setCalories(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Protein (g)</label>
              <input type="number" value={protein} onChange={(e) => setProtein(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Carbs (g)</label>
              <input type="number" value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fat (g)</label>
              <input type="number" value={fat} onChange={(e) => setFat(Number(e.target.value))} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Meals ({meals.length})</h2>
            <button type="button" onClick={addMeal} className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Meal
            </button>
          </div>

          {meals.map((meal, mi) => (
            <div key={mi} className="bg-background border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select value={meal.type} onChange={(e) => { const u = [...meals]; u[mi].type = e.target.value as any; u[mi].name = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1); setMeals(u); }} className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm text-white">
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((t) => <option key={t} value={t} className="bg-gray-900">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                  <span className="text-xs text-muted">{meal.foods.length} items</span>
                </div>
                {meals.length > 1 && (
                  <button type="button" onClick={() => removeMeal(mi)} className="p-1 text-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>

              {meal.foods.map((food, fi) => (
                <div key={fi} className="grid grid-cols-7 gap-2 items-center">
                  <input type="text" value={food.name} onChange={(e) => updateFood(mi, fi, 'name', e.target.value)} className={`col-span-2 ${inputClass}`} placeholder="Food name" />
                  <input type="number" value={food.quantity} onChange={(e) => updateFood(mi, fi, 'quantity', Number(e.target.value))} className={inputClass} placeholder="Qty" />
                  <input type="number" value={food.calories} onChange={(e) => updateFood(mi, fi, 'calories', Number(e.target.value))} className={inputClass} placeholder="Cal" />
                  <input type="number" value={food.protein} onChange={(e) => updateFood(mi, fi, 'protein', Number(e.target.value))} className={inputClass} placeholder="P(g)" />
                  <input type="number" value={food.carbs} onChange={(e) => updateFood(mi, fi, 'carbs', Number(e.target.value))} className={inputClass} placeholder="C(g)" />
                  <div className="flex items-center gap-1">
                    <input type="number" value={food.fat} onChange={(e) => updateFood(mi, fi, 'fat', Number(e.target.value))} className={inputClass} placeholder="F(g)" />
                    {meal.foods.length > 1 && (
                      <button type="button" onClick={() => removeFood(mi, fi)} className="p-1 text-muted hover:text-danger shrink-0"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addFood(mi)} className="text-xs text-primary hover:text-primary-hover transition-colors">+ Add food item</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50">
            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Create Diet Plan
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
