import { captureMessage } from '../monitoring';
import { PerformanceMetrics, isPerformanceDegraded } from './performance';

export interface AlertThresholds {
  cpu: number;
  memory: number;
  latency: number;
  errorRate: number;
}

export interface AlertConfig {
  enabled: boolean;
  thresholds: AlertThresholds;
  channels: ('email' | 'slack' | 'webhook')[];
  cooldown: number; // minutes
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  cpu: 70,
  memory: 80,
  latency: 1000,
  errorRate: 5
};

let lastAlertTime: number | null = null;

export async function checkAndSendAlerts(
  metrics: PerformanceMetrics,
  config: AlertConfig = {
    enabled: true,
    thresholds: DEFAULT_THRESHOLDS,
    channels: ['email'],
    cooldown: 15
  }
) {
  if (!config.enabled) return;

  // Check cooldown period
  if (lastAlertTime && Date.now() - lastAlertTime < config.cooldown * 60 * 1000) {
    return;
  }

  if (isPerformanceDegraded(metrics)) {
    const alerts = [];

    if (metrics.cpu > config.thresholds.cpu) {
      alerts.push(`High CPU usage: ${metrics.cpu.toFixed(1)}%`);
    }
    if (metrics.memory > config.thresholds.memory) {
      alerts.push(`High memory usage: ${metrics.memory.toFixed(1)}%`);
    }
    if (metrics.requestLatency > config.thresholds.latency) {
      alerts.push(`High latency: ${metrics.requestLatency.toFixed(0)}ms`);
    }
    if (metrics.errorRate > config.thresholds.errorRate) {
      alerts.push(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
    }

    if (alerts.length > 0) {
      const message = `Performance Alert:\n${alerts.join('\n')}`;
      captureMessage(message, 'warning');
      lastAlertTime = Date.now();

      // Send alerts through configured channels
      for (const channel of config.channels) {
        await sendAlert(channel, message);
      }
    }
  }
}

async function sendAlert(channel: 'email' | 'slack' | 'webhook', message: string) {
  try {
    const response = await fetch('/api/send-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, message })
    });

    if (!response.ok) {
      throw new Error(`Failed to send ${channel} alert`);
    }
  } catch (error) {
    captureMessage(`Failed to send alert: ${error}`, 'error');
  }
}