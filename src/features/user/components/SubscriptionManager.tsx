import React from 'react';
import { useUser } from '../contexts/UserContext';
import { CreditCard, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export default function SubscriptionManager() {
  const { user } = useUser();
  const { loading, cancelSubscription, reactivateSubscription } = useSubscription();

  if (!user) return null;

  const isActive = user.subscription.status === 'active';
  const willCancel = user.subscription.cancelAtPeriodEnd;
  const periodEnd = user.subscription.currentPeriodEnd
    ? new Date(user.subscription.currentPeriodEnd)
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow divide-y">
        <div className="p-6">
          <h2 className="text-lg font-medium">Subscription Status</h2>
          <div className="mt-4 flex items-center space-x-2">
            {isActive ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">Active</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Inactive</span>
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-medium">Plan Details</h3>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="mt-1 font-medium">{user.subscription.plan === 'pro' ? 'Pro' : 'Free'}</p>
            </div>
            {periodEnd && (
              <div>
                <p className="text-sm text-gray-500">Renewal Date</p>
                <p className="mt-1 font-medium">{periodEnd.toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {user.subscription.plan === 'pro' && (
          <div className="p-6">
            <h3 className="font-medium">Billing</h3>
            <div className="mt-4">
              {willCancel ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Zap className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Subscription will end on {periodEnd?.toLocaleDateString()}
                      </h3>
                      <div className="mt-2">
                        <button
                          onClick={reactivateSubscription}
                          disabled={loading}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Reactivate Subscription'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={cancelSubscription}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {user.subscription.plan === 'free' && (
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-medium">Upgrade to Pro</h3>
          <p className="mt-2">Get unlimited access to all features and priority support.</p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-600 focus:ring-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}