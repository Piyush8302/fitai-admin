'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createDietPlan } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Loader2, Utensils, Clock, Droplets } from 'lucide-react';
import toast from 'react-hot-toast';

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  type: string;
  time: string;
  items: FoodItem[];
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', time: '8:00 AM' },
  { value: 'mid_morning', label: 'Mid Morning', time: '10:30 AM' },
  { value: 'lunch', label: 'Lunch', time: '1:00 PM' },
  { value: 'evening_snack', label: 'Evening Snack', time: '4:30 PM' },
  { value: 'dinner', label: 'Dinner', time: '8:00 PM' },
  { value: 'pre_workout', label: 'Pre Workout', time: '6:00 AM' },
  { value: 'post_workout', label: 'Post Workout', time: '7:30 AM' },
];

const GOALS = [
  { value: 'weight_loss', label: 'Weight Loss' },
  { value: 'weight_gain', label: 'Weight Gain' },
  { value: 'muscle_building', label: 'Muscle Building' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'keto', label: 'Keto' },
  { value: 'intermittent_fasting', label: 'Intermittent Fasting' },
];

const DIET_TYPES = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non_veg', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'eggetarian', label: 'Eggetarian' },
];

const DAYS = [
  { value: 'any', label: 'Any Day' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const emptyFood = (): FoodItem => ({ name: '', quantity: '1 serving', calories: 0, protein: 0, carbs: 0, fat: 0 });

export default function NewDietPlanPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('weight_loss');
  const [dietType, setDietType] = useState('veg');
  const [dayOfWeek, setDayOfWeek] = useState('any');
  const [waterIntake, setWaterIntake] = useState(3);
  const [isPremium, setIsPremium] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([
    { type: 'breakfast', time: '8:00 AM', items: [emptyFood()] },
  ]);

  const mutation = useMutation({
    mutationFn: createDietPlan,
    onSuccess: () => { toast.success('Diet plan created!'); router.push('/diet-plans'); },
    onError: () => toast.error('Failed to create diet plan'),
  });

  // Auto-calculate totals
  const totalCalories = meals.reduce((s, m) => s + m.items.reduce((s2, f) => s2 + (f.calories || 0), 0), 0);
  const totalProtein = meals.reduce((s, m) => s + m.items.reduce((s2, f) => s2 + (f.protein || 0), 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + m.items.reduce((s2, f) => s2 + (f.carbs || 0), 0), 0);
  const totalFat = meals.reduce((s, m) => s + m.items.reduce((s2, f) => s2 + (f.fat || 0), 0), 0);

  const addMeal = () => {
    const usedTypes = meals.map(m => m.type);
    const next = MEAL_TYPES.find(mt => !usedTypes.includes(mt.value)) || MEAL_TYPES[0];
    setMeals([...meals, { type: next.value, time: next.time, items: [emptyFood()] }]);
  };

  const removeMeal = (i: number) => setMeals(meals.filter((_, idx) => idx !== i));

  const updateMealType = (mi: number, type: string) => {
    const u = [...meals];
    u[mi].type = type;
    u[mi].time = MEAL_TYPES.find(mt => mt.value === type)?.time || '';
    setMeals(u);
  };

  const addFood = (mi: number) => {
    const u = [...meals];
    u[mi].items.push(emptyFood());
    setMeals(u);
  };

  const removeFood = (mi: number, fi: number) => {
    const u = [...meals];
    u[mi].items = u[mi].items.filter((_, i) => i !== fi);
    setMeals(u);
  };

  const updateFood = (mi: number, fi: number, field: keyof FoodItem, value: string | number) => {
    const u = [...meals];
    (u[mi].items[fi] as any)[field] = value;
    setMeals([...u]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (meals.some(m => m.items.some(f => !f.name.trim()))) return toast.error('All food items need a name');

    const mealsWithTotals = meals.map(m => ({
      ...m,
      totalCalories: m.items.reduce((s, f) => s + (f.calories || 0), 0),
      totalProtein: m.items.reduce((s, f) => s + (f.protein || 0), 0),
    }));

    mutation.mutate({
      title, description, goal, dietType, dayOfWeek, waterIntake, isPremium,
      totalCalories, totalProtein, meals: mealsWithTotals,
    } as any);
  };

  const inputClass = 'w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-white placeholder-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-xs font-medium text-muted uppercase tracking-wider mb-1.5';

  return (
    <div className="max-w-3xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-white">Create Diet Plan</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <label className={labelClass}>Plan Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. High Protein Indian Veg Plan" />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[60px]`} placeholder="Brief description of this plan..." />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={labelClass}>Goal</label>
              <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputClass}>
                {GOALS.map(g => <option key={g.value} value={g.value} className="bg-gray-900">{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Diet Type</label>
              <select value={dietType} onChange={(e) => setDietType(e.target.value)} className={inputClass}>
                {DIET_TYPES.map(d => <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Day</label>
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className={inputClass}>
                {DAYS.map(d => <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Water (L)</label>
              <input type="number" step="0.5" min="0" value={waterIntake} onChange={(e) => setWaterIntake(Number(e.target.value))} className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background" />
            <span className="text-sm text-gray-300">Premium Only</span>
          </label>
        </div>

        {/* Auto Totals Bar */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-muted uppercase tracking-wider">Auto Totals</span>
            <div className="flex items-center gap-5 text-sm">
              <span className="text-white font-semibold">{totalCalories} <span className="text-muted font-normal">kcal</span></span>
              <span className="text-blue-400 font-semibold">{totalProtein}g <span className="text-muted font-normal">P</span></span>
              <span className="text-amber-400 font-semibold">{totalCarbs}g <span className="text-muted font-normal">C</span></span>
              <span className="text-red-400 font-semibold">{totalFat}g <span className="text-muted font-normal">F</span></span>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Meals</h2>
            <button type="button" onClick={addMeal} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Meal
            </button>
          </div>

          {meals.map((meal, mi) => {
            const mealCal = meal.items.reduce((s, f) => s + (f.calories || 0), 0);
            return (
              <div key={mi} className="bg-card border border-border rounded-2xl overflow-hidden">
                {/* Meal Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card-hover/50">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-4 h-4 text-primary" />
                    <select value={meal.type} onChange={(e) => updateMealType(mi, e.target.value)} className="bg-transparent text-sm font-medium text-white border-none focus:outline-none cursor-pointer">
                      {MEAL_TYPES.map(mt => <option key={mt.value} value={mt.value} className="bg-gray-900">{mt.label}</option>)}
                    </select>
                    <div className="flex items-center gap-1 text-xs text-muted">
                      <Clock className="w-3 h-3" />
                      <input type="text" value={meal.time} onChange={(e) => { const u = [...meals]; u[mi].time = e.target.value; setMeals(u); }} className="bg-transparent border-none w-20 text-xs text-muted focus:outline-none focus:text-white" placeholder="Time" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{mealCal} kcal</span>
                    {meals.length > 1 && (
                      <button type="button" onClick={() => removeMeal(mi)} className="p-1 text-muted hover:text-danger transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>

                {/* Food Items */}
                <div className="p-4 space-y-3">
                  {meal.items.map((food, fi) => (
                    <div key={fi} className="flex items-start gap-3 group">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input type="text" value={food.name} onChange={(e) => updateFood(mi, fi, 'name', e.target.value)} className={inputClass} placeholder="Food name (e.g. Paneer Tikka)" />
                        <input type="text" value={food.quantity} onChange={(e) => updateFood(mi, fi, 'quantity', e.target.value)} className={inputClass} placeholder="Qty (e.g. 1 cup, 200g)" />
                        <div className="grid grid-cols-4 gap-2 md:col-span-2">
                          <div>
                            <span className="text-[10px] text-muted ml-1">Cal</span>
                            <input type="number" value={food.calories || ''} onChange={(e) => updateFood(mi, fi, 'calories', Number(e.target.value))} className={inputClass} placeholder="0" />
                          </div>
                          <div>
                            <span className="text-[10px] text-blue-400 ml-1">Protein</span>
                            <input type="number" value={food.protein || ''} onChange={(e) => updateFood(mi, fi, 'protein', Number(e.target.value))} className={inputClass} placeholder="0" />
                          </div>
                          <div>
                            <span className="text-[10px] text-amber-400 ml-1">Carbs</span>
                            <input type="number" value={food.carbs || ''} onChange={(e) => updateFood(mi, fi, 'carbs', Number(e.target.value))} className={inputClass} placeholder="0" />
                          </div>
                          <div>
                            <span className="text-[10px] text-red-400 ml-1">Fat</span>
                            <input type="number" value={food.fat || ''} onChange={(e) => updateFood(mi, fi, 'fat', Number(e.target.value))} className={inputClass} placeholder="0" />
                          </div>
                        </div>
                      </div>
                      {meal.items.length > 1 && (
                        <button type="button" onClick={() => removeFood(mi, fi)} className="mt-2 p-1 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => addFood(mi)} className="flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors mt-1">
                    <Plus className="w-3 h-3" /> Add Food Item
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-sm font-medium text-white transition-colors disabled:opacity-50">
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Diet Plan
          </button>
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-300 transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
