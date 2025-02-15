import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UpdateProfileData } from '../types';
import { useUser } from '../contexts/UserContext';
import { handleError } from '@/lib/monitoring/errors';
import { validateFileUpload } from '@/lib/security';
import toast from 'react-hot-toast';

export function useProfile() {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);

      const updates: UpdateProfileData = {};

      if (data.fullName) {
        updates.fullName = data.fullName;
      }

      if (data.preferences) {
        updates.preferences = {
          ...user.preferences,
          ...data.preferences
        };
      }

      await updateUser(updates);
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);

      const validation = validateFileUpload(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await updateUser({ avatarUrl: publicUrl });
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateProfile,
    uploadAvatar
  };
}