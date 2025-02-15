import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, UserX, Lock, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SecurityMetrics {
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  activeUsers: number;
}

interface SecurityAlert {
  id: string;
  type: 'login_attempt' | 'suspicious_activity' | 'ip_blocked' | 'user_suspended';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
}

export default function SecurityDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    failedLogins: 0,
    suspiciousActivities: 0,
    blockedIPs: 0,
    activeUsers: 0
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, these would be actual API calls
      const metricsData = {
        failedLogins: 23,
        suspiciousActivities: 5,
        blockedIPs: 12,
        activeUsers: 156
      };

      const alertsData = [
        {
          id: '1',
          type: 'login_attempt' as const,
          severity: 'high' as const,
          message: 'Multiple failed login attempts from IP 192.168.1.1',
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          type: 'suspicious_activity' as const,
          severity: 'medium' as const,
          message: 'Unusual access pattern detected for user john@example.com',
          timestamp: new Date().toISOString()
        }
      ];

      setMetrics(metricsData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: SecurityAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-blue-600 bg-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserX className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Failed Logins (24h)
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.failedLogins}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Suspicious Activities
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.suspiciousActivities}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Blocked IPs
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.blockedIPs}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Users
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {metrics.activeUsers}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Security Alerts
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <li key={alert.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <p className="ml-2 text-sm text-gray-600">
                      {alert.message}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getSeverityColor(alert.severity)
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="ml-4 text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}