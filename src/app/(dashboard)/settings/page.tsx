'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Settings, User, Shield, Bell, Database, Loader2, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'system', label: 'System', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-muted mt-1">Manage your admin account and system settings</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">Admin Profile</h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{user?.name || 'Admin'}</p>
              <p className="text-sm text-muted">{user?.email}</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1 capitalize">
                {user?.role || 'admin'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <span className="text-xs text-muted uppercase tracking-wider">Name</span>
              <p className="text-sm text-white mt-1">{user?.name || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted uppercase tracking-wider">Email</span>
              <p className="text-sm text-white mt-1">{user?.email || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted uppercase tracking-wider">Role</span>
              <p className="text-sm text-white mt-1 capitalize">{user?.role || '—'}</p>
            </div>
            <div>
              <span className="text-xs text-muted uppercase tracking-wider">Account Status</span>
              <p className="text-sm text-success mt-1">Active</p>
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Backend URL', value: process.env.NEXT_PUBLIC_API_URL || 'https://fitai-backend-icbh.onrender.com' },
                { label: 'App Version', value: 'v2.0.0' },
                { label: 'Framework', value: 'Next.js + TypeScript' },
                { label: 'Database', value: 'MongoDB Atlas' },
              ].map((item) => (
                <div key={item.label} className="bg-background border border-border rounded-xl p-4">
                  <span className="text-xs text-muted uppercase tracking-wider">{item.label}</span>
                  <p className="text-sm text-white mt-1 font-mono">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Backend Health Check', url: 'https://fitai-backend-icbh.onrender.com/health' },
                { label: 'API Documentation', url: 'https://fitai-backend-icbh.onrender.com/api-docs' },
                { label: 'GitHub - Backend', url: 'https://github.com/Piyush8302/fitai-backend' },
                { label: 'GitHub - Mobile App', url: 'https://github.com/Piyush8302/Fitai-MobileApp' },
              ].map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-colors group">
                  <span className="text-sm text-gray-300 group-hover:text-white">{link.label}</span>
                  <ExternalLink className="w-4 h-4 text-muted group-hover:text-primary" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Security</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-background border border-border rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-white">Change Password</p>
                  <p className="text-xs text-muted mt-0.5">Update your admin account password</p>
                </div>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-sm text-white transition-colors">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between bg-background border border-border rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-white">Active Sessions</p>
                  <p className="text-xs text-muted mt-0.5">Manage your active login sessions</p>
                </div>
                <span className="text-sm text-success">1 active</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-danger/30 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-danger mb-2">Danger Zone</h2>
            <p className="text-sm text-muted mb-4">Irreversible actions that affect your account</p>
            <button onClick={logout} className="px-4 py-2 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl text-sm font-medium transition-colors">
              Logout from Admin Portal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
