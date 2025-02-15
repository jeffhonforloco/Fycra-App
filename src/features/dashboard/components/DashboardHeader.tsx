import React from 'react';
import { useUser } from '@/features/user/contexts/UserContext';
import { Settings, HelpCircle, Bell } from 'lucide-react';

export default function DashboardHeader() {
  const { user } = useUser();

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.fullName || 'Creator'}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Here's what's happening with your thumbnails
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-gray-500"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}