import React from 'react';
import { getCurrentUsage, getPlanLimits, calculateUsageCosts } from '../lib/billing';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface UsageStatsProps {
  userId: string;
  plan: 'free' | 'pro';
}

export default function UsageStats({ userId, plan }: UsageStatsProps) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [usage, setUsage] = React.useState<{
    current: { imagesGenerated: number; storageUsed: number; bandwidthUsed: number; };
    limits: { images: number; storage: number; bandwidth: number; };
    costs?: { images: number; storage: number; bandwidth: number; total: number; };
  } | null>(null);

  React.useEffect(() => {
    async function loadUsage() {
      try {
        setLoading(true);
        setError(null);
        
        const [currentUsage, costs] = await Promise.all([
          getCurrentUsage(userId),
          plan === 'pro' ? calculateUsageCosts(userId) : null
        ]);

        setUsage({
          current: currentUsage,
          limits: getPlanLimits(plan),
          costs: costs || undefined
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
        toast.error('Failed to load usage data');
      } finally {
        setLoading(false);
      }
    }

    loadUsage();
  }, [userId, plan]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!usage) return null;

  return (
    <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900">Usage Statistics</h3>
        <p className="mt-1 text-sm text-gray-500">
          Current billing period
        </p>
      </div>

      <div className="px-6 py-4">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Images Generated</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                {usage.current.imagesGenerated}
                <span className="ml-2 text-sm font-medium text-gray-500">
                  / {usage.limits.images === Infinity ? '∞' : usage.limits.images}
                </span>
              </div>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Storage Used</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                {usage.current.storageUsed.toFixed(1)} GB
                <span className="ml-2 text-sm font-medium text-gray-500">
                  / {usage.limits.storage === Infinity ? '∞' : `${usage.limits.storage} GB`}
                </span>
              </div>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Bandwidth Used</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                {usage.current.bandwidthUsed.toFixed(1)} GB
                <span className="ml-2 text-sm font-medium text-gray-500">
                  / {usage.limits.bandwidth === Infinity ? '∞' : `${usage.limits.bandwidth} GB`}
                </span>
              </div>
            </dd>
          </div>
        </dl>
      </div>

      {usage.costs && (
        <div className="px-6 py-4">
          <h4 className="text-sm font-medium text-gray-500">Current Charges</h4>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-gray-500">Images</dt>
              <dd className="mt-1 text-lg font-medium text-gray-900">
                ${usage.costs.images.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Storage</dt>
              <dd className="mt-1 text-lg font-medium text-gray-900">
                ${usage.costs.storage.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Bandwidth</dt>
              <dd className="mt-1 text-lg font-medium text-gray-900">
                ${usage.costs.bandwidth.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Total</dt>
              <dd className="mt-1 text-lg font-medium text-gray-900">
                ${usage.costs.total.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}