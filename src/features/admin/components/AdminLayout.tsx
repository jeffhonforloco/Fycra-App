import React from 'react';
import { Users, Settings, Activity, Database, Shield, Bell, FileText, Cog } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Overview', href: '/admin', icon: Activity },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Security', href: '/admin/security', icon: Shield },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'Audit Log', href: '/admin/audit', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Cog }
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        isActive
                          ? 'border-b-2 border-red-500 text-gray-900'
                          : 'text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center">
              <button className="p-2 text-gray-400 hover:text-gray-500">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}