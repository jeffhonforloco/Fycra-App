import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { useUser } from '../contexts/UserContext';
import { Sun, Moon, Monitor, Bell, Eye, Loader2 } from 'lucide-react';
import { UserPreferences } from '../types';

export default function PreferencesForm() {
  const { user } = useUser();
  const { loading, updateProfile } = useProfile();
  const [preferences, setPreferences] = React.useState<UserPreferences>(
    user?.preferences || {
      theme: 'system',
      emailNotifications: true,
      thumbnailStyle: 'modern',
      defaultPrivacy: 'public'
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ preferences });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Theme</h3>
        <p className="text-sm text-gray-500 mt-1">Choose your preferred theme</p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <ThemeButton
            icon={Sun}
            label="Light"
            selected={preferences.theme === 'light'}
            onClick={() => handleThemeChange('light')}
          />
          <ThemeButton
            icon={Moon}
            label="Dark"
            selected={preferences.theme === 'dark'}
            onClick={() => handleThemeChange('dark')}
          />
          <ThemeButton
            icon={Monitor}
            label="System"
            selected={preferences.theme === 'system'}
            onClick={() => handleThemeChange('system')}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Thumbnail Style</h3>
        <p className="text-sm text-gray-500 mt-1">Set your default thumbnail style</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {(['modern', 'dramatic', 'minimal', 'bold'] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setPreferences(prev => ({ ...prev, thumbnailStyle: style }))}
              className={`p-4 rounded-lg border-2 transition-all ${
                preferences.thumbnailStyle === style
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your email notifications</p>
          </div>
          <button
            type="button"
            onClick={() => setPreferences(prev => ({
              ...prev,
              emailNotifications: !prev.emailNotifications
            }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
              preferences.emailNotifications ? 'bg-red-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                preferences.emailNotifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
        <p className="text-sm text-gray-500 mt-1">Set default privacy for new thumbnails</p>
        <div className="mt-4 flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setPreferences(prev => ({ ...prev, defaultPrivacy: 'public' }))}
            className={`flex items-center px-4 py-2 rounded-md ${
              preferences.defaultPrivacy === 'public'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Public
          </button>
          <button
            type="button"
            onClick={() => setPreferences(prev => ({ ...prev, defaultPrivacy: 'private' }))}
            className={`flex items-center px-4 py-2 rounded-md ${
              preferences.defaultPrivacy === 'private'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Private
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Preferences'
        )}
      </button>
    </form>
  );
}

interface ThemeButtonProps {
  icon: React.ElementType;
  label: string;
  selected: boolean;
  onClick: () => void;
}

function ThemeButton({ icon: Icon, label, selected, onClick }: ThemeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
        selected
          ? 'border-red-500 bg-red-50 text-red-700'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <Icon className="w-6 h-6 mb-2" />
      {label}
    </button>
  );
}