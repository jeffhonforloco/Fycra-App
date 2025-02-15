import { supabase } from './supabase';
import { captureError } from './monitoring';

export interface Usage {
  imagesGenerated: number;
  storageUsed: number;
  bandwidthUsed: number;
}

export interface Limits {
  images: number;
  storage: number;
  bandwidth: number;
}

export async function getCurrentUsage(userId: string): Promise<Usage> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_usage', { p_user_id: userId });

    if (error) throw error;

    return data;
  } catch (error) {
    captureError(error as Error, { userId });
    throw error;
  }
}

export async function checkUsageLimits(userId: string): Promise<boolean> {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const usage = await getCurrentUsage(userId);
    const limits = getPlanLimits(user.plan);

    return (
      usage.imagesGenerated < limits.images &&
      usage.storageUsed < limits.storage &&
      usage.bandwidthUsed < limits.bandwidth
    );
  } catch (error) {
    captureError(error as Error, { userId });
    return false;
  }
}

export function getPlanLimits(plan: 'free' | 'pro'): Limits {
  return plan === 'free' ? {
    images: 50,
    storage: 1,
    bandwidth: 10
  } : {
    images: Infinity,
    storage: Infinity,
    bandwidth: Infinity
  };
}

export async function calculateUsageCosts(userId: string): Promise<{
  images: number;
  storage: number;
  bandwidth: number;
  total: number;
}> {
  try {
    const usage = await getCurrentUsage(userId);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (user.plan === 'free') {
      return { images: 0, storage: 0, bandwidth: 0, total: 0 };
    }

    // Pro plan pricing
    const imageCost = Math.max(0, usage.imagesGenerated - 50) * 0.02;
    const storageCost = Math.max(0, usage.storageUsed - 1) * 0.10;
    const bandwidthCost = Math.max(0, usage.bandwidthUsed - 10) * 0.05;

    return {
      images: imageCost,
      storage: storageCost,
      bandwidth: bandwidthCost,
      total: imageCost + storageCost + bandwidthCost
    };
  } catch (error) {
    captureError(error as Error, { userId });
    throw error;
  }
}