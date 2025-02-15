import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  category: string;
  last_updated: string;
  updated_by: string;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: dbError } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (dbError) throw dbError;
      setSettings(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load settings';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (id: string, value: any) => {
    setSettings(settings.map(setting => 
      setting.id === id ? { ...setting, value } : setting
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Update settings in batches
      const updates = settings.map(setting => ({
        id: setting.id,
        value: setting.value
      }));

      const { error } = await supabase
        .from('system_settings')
        .upsert(updates);

      if (error) throw error;
      
      toast.success('Settings saved successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  const categories = ['all', ...new Set(settings.map(s => s.category))];
  const filteredSettings = filter === 'all' 
    ? settings 
    : settings.filter(s => s.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configure global system settings and parameters
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6 py-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  filter === category
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {filteredSettings.map((setting) => (
              <div key={setting.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {setting.key}
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {setting.type}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 mb-4">
                  {setting.description}
                </p>

                {setting.type === 'boolean' ? (
                  <button
                    onClick={() => handleSettingChange(setting.id, !setting.value)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                      setting.value ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        setting.value ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                ) : setting.type === 'number' ? (
                  <input
                    type="number"
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.id, parseFloat(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                ) : setting.type === 'json' ? (
                  <textarea
                    value={JSON.stringify(setting.value, null, 2)}
                    onChange={(e) => {
                      try {
                        const value = JSON.parse(e.target.value);
                        handleSettingChange(setting.id, value);
                      } catch (err) {
                        // Don't update if JSON is invalid
                      }
                    }}
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 font-mono text-sm"
                  />
                ) : (
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  />
                )}

                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>Last updated: {new Date(setting.last_updated).toLocaleString()}</span>
                  <span>By: {setting.updated_by}</span>
                </div>

                {setting.type === 'json' && (
                  <div className="mt-2 flex items-center text-xs text-yellow-700">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Ensure valid JSON format
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}