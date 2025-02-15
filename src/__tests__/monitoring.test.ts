import { describe, it, expect, vi } from 'vitest';
import { trackPerformanceMetrics, isPerformanceDegraded } from '../lib/monitoring/performance';
import { checkAndSendAlerts } from '../lib/monitoring/alerts';
import { checkAndApplyScaling } from '../lib/monitoring/scaling';

describe('Monitoring System', () => {
  describe('Performance Tracking', () => {
    it('should detect degraded performance', () => {
      const metrics = {
        cpu: 85,
        memory: 90,
        requestLatency: 1500,
        errorRate: 6,
        timestamp: new Date().toISOString()
      };

      expect(isPerformanceDegraded(metrics)).toBe(true);
    });

    it('should handle healthy performance', () => {
      const metrics = {
        cpu: 50,
        memory: 60,
        requestLatency: 200,
        errorRate: 0.5,
        timestamp: new Date().toISOString()
      };

      expect(isPerformanceDegraded(metrics)).toBe(false);
    });
  });

  describe('Alerts', () => {
    it('should send alerts when thresholds are exceeded', async () => {
      const metrics = {
        cpu: 90,
        memory: 85,
        requestLatency: 2000,
        errorRate: 8,
        timestamp: new Date().toISOString()
      };

      const sendAlert = vi.fn();
      await checkAndSendAlerts(metrics, {
        enabled: true,
        thresholds: {
          cpu: 80,
          memory: 80,
          latency: 1000,
          errorRate: 5
        },
        channels: ['email'],
        cooldown: 15
      });

      expect(sendAlert).toHaveBeenCalled();
    });
  });

  describe('Auto Scaling', () => {
    it('should trigger scaling when needed', async () => {
      const metrics = {
        cpu: 85,
        memory: 75,
        requestLatency: 800,
        errorRate: 3,
        timestamp: new Date().toISOString()
      };

      const scaleUp = vi.fn();
      await checkAndApplyScaling(metrics, {
        enabled: true,
        rules: [
          {
            metric: 'cpu',
            condition: 'above',
            threshold: 80,
            action: 'scale_up',
            cooldown: 5
          }
        ],
        minInstances: 2,
        maxInstances: 10
      });

      expect(scaleUp).toHaveBeenCalled();
    });
  });
});