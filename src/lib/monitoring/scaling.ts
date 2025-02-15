import { PerformanceMetrics } from './performance';
import { captureMessage } from '../monitoring';

export interface ScalingRule {
  metric: keyof PerformanceMetrics;
  condition: 'above' | 'below';
  threshold: number;
  action: 'scale_up' | 'scale_down';
  cooldown: number; // minutes
}

export interface ScalingConfig {
  enabled: boolean;
  rules: ScalingRule[];
  minInstances: number;
  maxInstances: number;
}

const DEFAULT_SCALING_CONFIG: ScalingConfig = {
  enabled: true,
  rules: [
    {
      metric: 'cpu',
      condition: 'above',
      threshold: 70,
      action: 'scale_up',
      cooldown: 5
    },
    {
      metric: 'memory',
      condition: 'above',
      threshold: 80,
      action: 'scale_up',
      cooldown: 5
    },
    {
      metric: 'cpu',
      condition: 'below',
      threshold: 30,
      action: 'scale_down',
      cooldown: 10
    }
  ],
  minInstances: 2,
  maxInstances: 10
};

const lastScalingActions = new Map<string, number>();

export async function checkAndApplyScaling(
  metrics: PerformanceMetrics,
  config: ScalingConfig = DEFAULT_SCALING_CONFIG
) {
  if (!config.enabled) return;

  for (const rule of config.rules) {
    const lastAction = lastScalingActions.get(rule.metric);
    if (lastAction && Date.now() - lastAction < rule.cooldown * 60 * 1000) {
      continue;
    }

    const metricValue = metrics[rule.metric];
    const shouldScale = rule.condition === 'above' 
      ? metricValue > rule.threshold
      : metricValue < rule.threshold;

    if (shouldScale) {
      await applyScalingAction(rule.action, config);
      lastScalingActions.set(rule.metric, Date.now());
      
      captureMessage(
        `Scaling action triggered: ${rule.action} due to ${rule.metric} ${rule.condition} ${rule.threshold}`,
        'info'
      );
    }
  }
}

async function applyScalingAction(action: 'scale_up' | 'scale_down', config: ScalingConfig) {
  try {
    const response = await fetch('/api/scale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        minInstances: config.minInstances,
        maxInstances: config.maxInstances
      })
    });

    if (!response.ok) {
      throw new Error('Failed to apply scaling action');
    }
  } catch (error) {
    captureMessage(`Failed to apply scaling action: ${error}`, 'error');
  }
}