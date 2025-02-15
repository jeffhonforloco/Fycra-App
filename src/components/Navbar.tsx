import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Youtube, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface NavbarProps {
  user: SupabaseUser | null;
}

export default function Navbar({ user }: NavbarProps) {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (err) {
      toast.error('Failed to sign out');
    }
  };

  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Youtube className="w-8 h-8 text-red-600" />
            <span className="text-xl font-bold">Fycra</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/generate" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Thumbnail
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => supabase.auth.signInWithPassword({
                  email: 'demo@example.com',
                  password: 'password123'
                })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}