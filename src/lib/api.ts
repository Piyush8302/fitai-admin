import axios from 'axios';
import type {
  AuthResponse,
  DashboardStats,
  User,
  Workout,
  DietPlan,
  Article,
  Subscription,
  Notification,
  ChatMessage,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://fitai-backend-icbh.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fitai_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('fitai_admin_token');
        localStorage.removeItem('fitai_admin_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/api/auth/me');
  return data.user ?? data;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/api/admin/dashboard');
  return data;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUsers(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await api.get('/api/admin/users', { params });
  return data;
}

export async function getUserById(id: string) {
  const { data } = await api.get(`/api/admin/users/${id}`);
  // data.data = { user, subscriptions, recentTracking, totalWorkoutDays }
  const detail = data.data ?? data;
  return detail.user
    ? { ...detail.user, _subscriptions: detail.subscriptions, _recentTracking: detail.recentTracking, _totalWorkoutDays: detail.totalWorkoutDays }
    : detail;
}

export async function toggleUserPremium(id: string) {
  const { data } = await api.put(`/api/admin/users/${id}/toggle-premium`);
  return data;
}

export async function deactivateUser(id: string) {
  const { data } = await api.put(`/api/admin/users/${id}/deactivate`);
  return data;
}

// ─── Subscriptions ───────────────────────────────────────────────────────────

export async function getSubscriptions(params?: { status?: string; page?: number }) {
  const { data } = await api.get('/api/admin/subscriptions', { params });
  return data;
}

// ─── Workouts ────────────────────────────────────────────────────────────────

export async function getWorkouts(): Promise<Workout[]> {
  const { data } = await api.get('/api/workouts');
  return data.workouts ?? data;
}

export async function getWorkoutById(id: string): Promise<Workout> {
  const { data } = await api.get(`/api/workouts/${id}`);
  return data.workout ?? data;
}

export async function createWorkout(workout: Partial<Workout>): Promise<Workout> {
  const { data } = await api.post('/api/workouts', workout);
  return data.workout ?? data;
}

export async function updateWorkout(id: string, workout: Partial<Workout>): Promise<Workout> {
  const { data } = await api.put(`/api/workouts/${id}`, workout);
  return data.workout ?? data;
}

export async function deleteWorkout(id: string) {
  const { data } = await api.delete(`/api/workouts/${id}`);
  return data;
}

// ─── Diet Plans ──────────────────────────────────────────────────────────────

export async function getDietPlans(): Promise<DietPlan[]> {
  const { data } = await api.get('/api/diet');
  return data.dietPlans ?? data.diets ?? data;
}

export async function getDietPlanById(id: string): Promise<DietPlan> {
  const { data } = await api.get(`/api/diet/${id}`);
  return data.dietPlan ?? data;
}

export async function createDietPlan(plan: Partial<DietPlan>): Promise<DietPlan> {
  const { data } = await api.post('/api/diet', plan);
  return data.dietPlan ?? data;
}

export async function updateDietPlan(id: string, plan: Partial<DietPlan>): Promise<DietPlan> {
  const { data } = await api.put(`/api/diet/${id}`, plan);
  return data.dietPlan ?? data;
}

export async function deleteDietPlan(id: string) {
  const { data } = await api.delete(`/api/diet/${id}`);
  return data;
}

// ─── Articles ────────────────────────────────────────────────────────────────

export async function getArticles(): Promise<Article[]> {
  const { data } = await api.get('/api/articles');
  return data.articles ?? data;
}

export async function getArticleCategories(): Promise<string[]> {
  const { data } = await api.get('/api/articles/categories');
  return data.categories ?? data;
}

export async function getTrendingArticles(): Promise<Article[]> {
  const { data } = await api.get('/api/articles/trending');
  return data.articles ?? data;
}

export async function createArticle(article: Partial<Article>): Promise<Article> {
  const { data } = await api.post('/api/articles', article);
  return data.article ?? data;
}

export async function updateArticle(id: string, article: Partial<Article>): Promise<Article> {
  const { data } = await api.put(`/api/articles/${id}`, article);
  return data.article ?? data;
}

export async function deleteArticle(id: string) {
  const { data } = await api.delete(`/api/articles/${id}`);
  return data;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function sendNotification(notification: Notification) {
  const { data } = await api.post('/api/notifications/send', notification);
  return data;
}

export async function sendDailyTip() {
  const { data } = await api.post('/api/notifications/daily-tip');
  return data;
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export async function getChatHistory(): Promise<ChatMessage[]> {
  const { data } = await api.get('/api/chat/history');
  return data.messages ?? data;
}

// ─── Food & Exercises ────────────────────────────────────────────────────────

export async function getFoods() {
  const { data } = await api.get('/api/food');
  return data.foods ?? data;
}

export async function getExercises() {
  const { data } = await api.get('/api/exercises');
  return data.exercises ?? data;
}

export default api;
