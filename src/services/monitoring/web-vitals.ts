/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { onCLS, onFID, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';
import { logger } from '../logging/logger.js';

/**
 * Web Vitals metrics
 */
export interface WebVitalsMetrics {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  FCP?: number; // First Contentful Paint
}

/**
 * Web Vitals tracker
 */
export class WebVitalsTracker {
  private metrics: WebVitalsMetrics = {};

  /**
   * Initialize Web Vitals tracking
   */
  init(): void {
    // Track LCP
    onLCP((metric) => {
      this.handleMetric('LCP', metric);
    });

    // Track FID
    onFID((metric) => {
      this.handleMetric('FID', metric);
    });

    // Track CLS
    onCLS((metric) => {
      this.handleMetric('CLS', metric);
    });

    // Track FCP
    onFCP((metric) => {
      this.handleMetric('FCP', metric);
    });

    // Track TTFB
    onTTFB((metric) => {
      this.handleMetric('TTFB', metric);
    });

    logger.info('Web Vitals tracking initialized');
  }

  /**
   * Handle metric update
   */
  private handleMetric(name: keyof WebVitalsMetrics, metric: Metric): void {
    this.metrics[name] = metric.value;

    // Log metric
    logger.info('Web Vitals metric', {
      metric: name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });

    // Check against budgets
    this.checkBudget(name, metric.value);

    // In production, send to CloudWatch
    if (import.meta.env.PROD) {
      this.sendToCloudWatch(name, metric.value);
    }
  }

  /**
   * Check metric against performance budget
   */
  private checkBudget(name: keyof WebVitalsMetrics, value: number): void {
    const budgets: Record<keyof WebVitalsMetrics, number> = {
      LCP: 2500, // 2.5s
      FID: 100, // 100ms
      CLS: 0.1, // 0.1
      TTFB: 800, // 800ms
      FCP: 1800, // 1.8s
    };

    const budget = budgets[name];
    if (budget && value > budget) {
      logger.warn('Performance budget exceeded', {
        metric: name,
        value,
        budget,
        exceeded: value - budget,
      });
    }
  }

  /**
   * Send metric to CloudWatch
   */
  private sendToCloudWatch(name: string, value: number): void {
    // TODO: Implement CloudWatch integration
    console.log(`Sending ${name}=${value} to CloudWatch`);
  }

  /**
   * Get current metrics
   */
  getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }
}

// Export singleton instance
export const webVitalsTracker = new WebVitalsTracker();
