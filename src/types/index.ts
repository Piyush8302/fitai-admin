export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  isActive: boolean;
  profileImage?: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  fitnessGoal?: string;
  activityLevel?: string;
  dietaryPreference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalWorkouts: number;
  totalDietPlans: number;
  totalArticles: number;
  recentUsers: User[];
  // Gym platform KPIs
  totalGyms?: number;
  activeGyms?: number;
  suspendedGyms?: number;
  totalGymMembers?: number;
  gymRevenue?: number;
  pendingOwnerRequests?: number;
}

export interface GymOwnerRef {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface GymListItem {
  _id: string;
  name: string;
  city: string;
  gymCode: string;
  phone: string;
  isActive: boolean;
  reactivationRequested?: boolean;
  hasLocation: boolean;
  owner: GymOwnerRef | null;
  members: number;
  revenue: number;
  createdAt: string;
}

export interface GymDetail {
  gym: {
    _id: string;
    name: string;
    city?: string;
    location?: string;
    phone?: string;
    gymCode: string;
    isActive: boolean;
    reactivationRequested?: boolean;
    reactivationNote?: string;
    hasLocation: boolean;
    slots: { open: string; close: string }[];
    planPrices: Record<string, number>;
    createdAt: string;
  };
  owner: GymOwnerRef | null;
  stats: {
    totalMembers: number;
    activeMembers: number;
    staffCount: number;
    revenue: number;
    payments: number;
    checkinsToday: number;
  };
  staff: { _id: string; name?: string; phone?: string; staffRole?: string; staffStatus?: string }[];
  members: {
    _id: string;
    user: { _id: string; name?: string; phone?: string; avatar?: string } | null;
    plan: string;
    fee: number;
    status: string;
    dueDate?: string;
    joinDate?: string;
  }[];
}

// One gym's activity inside a single (IST) month — the numbers plus the rows
// behind them, so a figure on the page can always be opened up.
export interface GymMemberRef {
  _id: string;
  name?: string;
  phone?: string;
}

export interface GymMonthSummary {
  key: string;            // 'YYYY-MM'
  label: string;          // 'August 2026'
  from: string;
  to: string;
  collection: { total: number; count: number; cash: number; online: number };
  cashbook: { income: number; expense: number; net: number };
  members: { joined: number; totalAtEnd: number };
  attendance: {
    checkins: number;
    uniqueMembers: number;
    activeDays: number;
    busiestDay: { day: string; checkins: number } | null;
    daily: { day: string; checkins: number }[];
  };
}

export interface GymMonthly {
  gym: { _id: string; name: string; createdAt: string };
  months: string[];
  month: GymMonthSummary;
  // null for the all-time view, which has no month before it to compare against
  prevMonth: { key: string; label: string; collection: number; expense: number; joined: number; checkins: number } | null;
  dues: {
    count: number;
    amount: number;
    list: {
      _id: string;
      user: GymMemberRef | null;
      plan: string;
      fee: number;
      status: string;
      dueDate?: string;
      lastPaidDate?: string;
      paid: boolean;
    }[];
  };
  payments: {
    _id: string;
    user: GymMemberRef | null;
    amount: number;
    plan?: string;
    method?: string;
    paidDate: string;
    note?: string;
  }[];
  joinedMembers: {
    _id: string;
    user: GymMemberRef | null;
    plan: string;
    fee: number;
    status: string;
    joinDate: string;
    registeredVia: string;
  }[];
  expenses: { _id: string; amount: number; description: string; date: string; method?: string }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Workout {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  caloriesBurned: number;
  exercises: Exercise[];
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  _id?: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  restTime?: number;
  description?: string;
  muscleGroup?: string;
}

export interface DietPlan {
  _id: string;
  name: string;
  description: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Meal {
  _id?: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  foods: FoodItem[];
}

export interface FoodItem {
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Article {
  _id: string;
  title: string;
  content: string;
  summary?: string;
  category: string;
  author: string;
  imageUrl?: string;
  tags: string[];
  isPublished: boolean;
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  _id: string;
  userId: string | User;
  plan: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: string;
  endDate: string;
  amount: number;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'promo';
  targetAudience: 'all' | 'premium' | 'free' | 'gym_owners' | 'gym_members';
  gymId?: string;
  sentAt?: string;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  message: string;
  response: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status: number;
}
