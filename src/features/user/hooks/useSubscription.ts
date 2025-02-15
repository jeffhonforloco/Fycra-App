import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '../contexts/UserContext';
import { handleError } from '@/lib/monitoring/errors';
import toast from 'react-hot-toast';

export function useSubscription() {
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);

  const cancelSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      await refreshUser();
      toast.success('Subscription will be cancelled at the end of the billing period');
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const reactivateSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reactivate subscription');
      }

      await refreshUser();
      toast.success('Subscription reactivated successfully');
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    cancelSubscription,
    reactivateSubscription
  };
}