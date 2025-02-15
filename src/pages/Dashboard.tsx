import React, { useEffect, useState } from 'react';
import { Download, Share2, Loader2, AlertCircle, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Database } from '../lib/database.types';
import SystemStatus from '../components/SystemStatus';
import { handleError } from '../lib/monitoring/errors';

type Thumbnail = Database['public']['Tables']['thumbnails']['Row'];

export default function Dashboard() {
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | '7days' | '30days'>('all');
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);

  useEffect(() => {
    loadThumbnails();
  }, [timeframe]);

  const loadThumbnails = async () => {
    try {
      let query = supabase
        .from('thumbnails')
        .select('*')
        .order('created_at', { ascending: false });

      if (timeframe === '7days') {
        query = query.gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      } else if (timeframe === '30days') {
        query = query.gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      }

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;
      setThumbnails(data || []);
    } catch (err) {
      const errorDetails = handleError(err as Error, { timeframe });
      setError(errorDetails.userMessage);
      toast.error(errorDetails.userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, title: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-thumbnail.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Thumbnail downloaded successfully');
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    }
  };

  const handleShare = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my YouTube thumbnail!',
          text: 'Generated with Fycra',
          url: imageUrl,
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success('Thumbnail URL copied to clipboard');
      }
    } catch (err) {
      const errorDetails = handleError(err as Error);
      toast.error(errorDetails.userMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Your Thumbnails</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
            className="rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
          <button
            onClick={() => setShowSystemStatus(!showSystemStatus)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="System Status"
          >
            <Activity className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-gray-500 hover:text-gray-700"
            title="Help & Troubleshooting"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showSystemStatus && (
        <SystemStatus />
      )}

      {showHelp && (
        <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Common Issues & Solutions</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Thumbnail not generating?</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                <li>Check your rate limits in the dashboard</li>
                <li>Ensure images meet minimum requirements (512x512px)</li>
                <li>Verify your subscription status</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Poor quality results?</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                <li>Use high-resolution source images</li>
                <li>Ensure proper lighting in source images</li>
                <li>Try different style presets</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Need more help?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Check our <a href="/docs/troubleshooting" className="text-red-600 hover:text-red-800">troubleshooting guide</a> or{' '}
                <a href="/support" className="text-red-600 hover:text-red-800">contact support</a>.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {thumbnails.length > 0 ? (
          thumbnails.map((thumbnail) => (
            <div key={thumbnail.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={thumbnail.image_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80'}
                  alt={thumbnail.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(thumbnail.image_url || '', thumbnail.title)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Download thumbnail"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShare(thumbnail.image_url || '')}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                      title="Share thumbnail"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">
                  {thumbnail.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Generated on {new Date(thumbnail.created_at).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    thumbnail.status === 'completed' ? 'bg-green-100 text-green-800' :
                    thumbnail.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {thumbnail.status.charAt(0).toUpperCase() + thumbnail.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No thumbnails found. Start generating some!</p>
          </div>
        )}
      </div>
    </div>
  );
}