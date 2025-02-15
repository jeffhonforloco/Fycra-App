import React, { useState, useEffect } from 'react';
import { Clock, Filter, Download, Search, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import ReactJson from 'react-json-view';

interface AuditEvent {
  id: string;
  timestamp: string;
  user_id: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
}

export default function AuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    dateRange: '7d',
    search: ''
  });

  useEffect(() => {
    loadAuditEvents();
  }, [filters]);

  const loadAuditEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }

      if (filters.dateRange) {
        const days = parseInt(filters.dateRange);
        query = query.gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
      }

      if (filters.search) {
        query = query.or(`user_id.ilike.%${filters.search}%,ip_address.ilike.%${filters.search}%`);
      }

      const { data, error: dbError } = await query;

      if (dbError) throw dbError;
      setEvents(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load audit events';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const csv = [
        ['Timestamp', 'User ID', 'Action', 'Resource', 'IP Address', 'User Agent', 'Details'].join(','),
        ...events.map(event => [
          event.timestamp,
          event.user_id,
          event.action,
          event.resource,
          event.ip_address,
          event.user_agent,
          JSON.stringify(event.details)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Audit log exported successfully');
    } catch (err) {
      toast.error('Failed to export audit log');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Audit Log</h2>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Resource</label>
              <select
                value={filters.resource}
                onChange={(e) => setFilters(f => ({ ...f, resource: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="">All Resources</option>
                <option value="user">User</option>
                <option value="thumbnail">Thumbnail</option>
                <option value="test">A/B Test</option>
                <option value="setting">Setting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
              >
                <option value="1d">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Search</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                  className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                  placeholder="Search user ID, IP..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {format(new Date(event.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      event.action === 'create' ? 'bg-green-100 text-green-800' :
                      event.action === 'update' ? 'bg-blue-100 text-blue-800' :
                      event.action === 'delete' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.ip_address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <ReactJson
                      src={event.details}
                      name={false}
                      collapsed={true}
                      displayDataTypes={false}
                      enableClipboard={false}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}