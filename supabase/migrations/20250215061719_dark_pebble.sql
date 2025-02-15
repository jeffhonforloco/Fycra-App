/*
  # Add Admin Tables

  1. New Tables
    - `audit_logs`: Tracks system events and user actions
    - `system_settings`: Stores global system configuration
    - `system_metrics`: Stores system performance metrics

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users,
  action text NOT NULL,
  resource text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text
);

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  type text NOT NULL,
  description text,
  category text NOT NULL,
  last_updated timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users
);

-- Create system_metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  metric_name text NOT NULL,
  value numeric NOT NULL,
  labels jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for audit_logs
CREATE POLICY "Admins can read audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND role = 'admin'
    )
  );

-- Create policies for system_settings
CREATE POLICY "Admins can read system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update system settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND role = 'admin'
    )
  );

-- Create policies for system_metrics
CREATE POLICY "Admins can read system metrics"
  ON system_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND role = 'admin'
    )
  );

-- Create functions for system metrics
CREATE OR REPLACE FUNCTION get_system_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'users', (SELECT count(*) FROM auth.users),
    'thumbnails', (SELECT count(*) FROM thumbnails),
    'storage_used', (SELECT sum(size) FROM storage.objects),
    'active_tests', (SELECT count(*) FROM ab_tests WHERE status = 'running')
  );
END;
$$;

-- Create function for database health check
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time timestamptz;
  query_time interval;
  result json;
BEGIN
  start_time := clock_timestamp();
  
  -- Perform basic health checks
  PERFORM count(*) FROM auth.users LIMIT 1;
  
  query_time := clock_timestamp() - start_time;
  
  result := json_build_object(
    'status', 'healthy',
    'latency_ms', EXTRACT(MILLISECOND FROM query_time),
    'connections', (SELECT count(*) FROM pg_stat_activity),
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;