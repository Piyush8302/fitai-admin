'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { getInitials } from '@/lib/utils';
import { LogOut, Bell } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/workouts': 'Workouts',
  '/workouts/new': 'Create Workout',
  '/diet-plans': 'Diet Plans',
  '/articles': 'Articles',
  '/articles/new': 'Create Article',
  '/subscriptions': 'Subscriptions',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export function Topbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getTitle = () => {
    // Exact match first
    if (pageTitles[pathname]) return pageTitles[pathname];
    // Check for user detail page
    if (pathname.startsWith('/users/')) return 'User Details';
    // Fallback to base path
    const basePath = '/' + pathname.split('/')[1];
    return pageTitles[basePath] || 'Dashboard';
  };

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-semibold text-white">{getTitle()}</h1>

      <div className="flex items-center gap-4">
        {/* Notifications indicator */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>

        {/* Admin info */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-muted">{user?.email || ''}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold">
            {user?.name ? getInitials(user.name) : 'A'}
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
