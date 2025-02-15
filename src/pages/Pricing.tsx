import React from 'react';
import { Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      '50 images per month',
      '1 GB storage',
      '10 GB bandwidth',
      'Basic A/B testing',
      'Community support'
    ],
    limits: {
      images: 50,
      storage: 1,
      bandwidth: 10
    }
  },
  {
    name: 'Pro',
    price: 29,
    features: [
      'Unlimited images ($0.02 per image)',
      'Unlimited storage ($0.10 per GB)',
      'Unlimited bandwidth ($0.05 per GB)',
      'Advanced A/B testing analytics',
      '24/7 Priority support'
    ],
    limits: {
      images: Infinity,
      storage: Infinity,
      bandwidth: Infinity
    }
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSubscribe = async (planName: string) => {
    try {
      setLoading(planName);
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        toast.error('Please sign in to subscribe');
        return;
      }

      if (planName === 'Free') {
        // Update user's plan in Supabase
        const { error } = await supabase
          .from('users')
          .update({ plan: 'free' })
          .eq('id', user.data.user.id);

        if (error) throw error;
        toast.success('Switched to Free plan');
        navigate('/dashboard');
        return;
      }

      // For paid plans, redirect to Stripe checkout
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName,
          userId: user.data.user.id
        }),
      });

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl;
    } catch (error) {
      toast.error('Failed to process subscription');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900">
                {plan.name}
              </h3>
              
              <p className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  ${plan.price}
                </span>
                <span className="ml-1 text-lg text-gray-500">/month</span>
              </p>

              <button
                onClick={() => handleSubscribe(plan.name)}
                disabled={loading === plan.name}
                className={`mt-8 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                  plan.price === 0 ? 'bg-gray-900 hover:bg-gray-800' : 'bg-red-600'
                }`}
              >
                {loading === plan.name ? (
                  <Zap className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  `Get ${plan.name} Plan`
                )}
              </button>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="ml-3 text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-base text-gray-600">
          Need a custom plan? {' '}
          <a href="mailto:support@example.com" className="text-red-600 hover:text-red-800">
            Contact us
          </a>
        </p>
      </div>
    </div>
  );
}