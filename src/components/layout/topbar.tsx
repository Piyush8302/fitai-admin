'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { getInitials } from '@/lib/utils';
import { LogOut, Menu } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/gyms': 'Gyms',
  '/gym-owners': 'Gym Owners',
  '/workouts': 'Workouts',
  '/workouts/new': 'Create Workout',
  '/diet-plans': 'Diet Plans',
  '/articles': 'Articles',
  '/articles/new': 'Create Article',
  '/subscriptions': 'Subscriptions',
  '/notifications': 'Notifications',
  '/analytics': 'Analytics',
  '/support': 'Support',
  '/settings': 'Settings',
};

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const getTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith('/users/')) return 'User Details';
    if (pathname.startsWith('/gyms/')) return 'Gym Details';
    const basePath = '/' + pathname.split('/')[1];
    return pageTitles[basePath] || 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-white truncate">{getTitle()}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Admin info */}
        <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-muted">{user?.email || ''}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold shrink-0">
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
