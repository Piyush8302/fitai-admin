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
