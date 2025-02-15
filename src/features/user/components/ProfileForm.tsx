import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { useUser } from '../contexts/UserContext';
import { User, Camera, Loader2 } from 'lucide-react';

export default function ProfileForm() {
  const { user } = useUser();
  const { loading, updateProfile, uploadAvatar } = useProfile();
  const [fullName, setFullName] = React.useState(user?.fullName || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ fullName });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <label
            htmlFor="avatar"
            className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50"
          >
            <Camera className="w-4 h-4 text-gray-600" />
            <input
              type="file"
              id="avatar"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={loading}
            />
          </label>
        </div>

        <div className="flex-1">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          value={user?.email || ''}
          disabled
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
        />
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
          'Save Changes'
        )}
      </button>
    </form>
  );
}