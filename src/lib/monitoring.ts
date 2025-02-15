import * as Sentry from '@sentry/react';
import { config } from './config';

export function initializeMonitoring() {
  if (config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.sentry.environment,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  console.error(error);
  if (config.sentry.dsn) {
    Sentry.captureException(error, {
      extra: context
    });
  }
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  if (config.sentry.dsn) {
    Sentry.captureMessage(message, level);
  }
}