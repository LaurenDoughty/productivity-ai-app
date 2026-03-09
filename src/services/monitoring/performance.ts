/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { logger } from '../logging/logger.js';

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  pageLoadTime?: number;
  timeToInteractive?: number;
  apiResponseTimes: number[];
  bundleSize?: number;
  cacheHitRate?: number;
}

/**
 * Performance metrics tracker
 */
export class PerformanceTracker {
  private metrics: PerformanceMetrics = {
    apiResponseTimes: [],
  };

  /**
   * Initialize performance tracking
   */
  init(): void {
    // Track page load time
    if (typeof window !== 'undefined' && window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.trackPageLoad();
        }, 0);
      });
    }

    logger.info('Performance tracking initialized');
  }

  /**
   * Track page load metrics
   */
  private trackPageLoad(): void {
    if (!window.performance || !window.performance.timing) {
      return;
    }

    const timing = window.performance.timing;
    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    const timeToInteractive = timing.domInteractive - timing.navigationStart;

    this.metrics.pageLoadTime = pageLoadTime;
    this.metrics.timeToInteractive = timeToInteractive;

    logger.info('Page load metrics', {
      pageLoadTime: `${pageLoadTime}ms`,
      timeToInteractive: `${timeToInteractive}ms`,
    });
  }

  /**
   * Track API response time
   */
  trackAPIResponse(latencyMs: number): void {
    this.metrics.apiResponseTimes.push(latencyMs);

    // Keep only last 100 measurements
    if (this.metrics.apiResponseTimes.length > 100) {
      this.metrics.apiResponseTimes.shift();
    }

    // Calculate percentiles
    const percentiles = this.calculatePercentiles(this.metrics.apiResponseTimes);

    logger.info('API response time', {
      latency: `${latencyMs}ms`,
      p50: `${percentiles.p50}ms`,
      p95: `${percentiles.p95}ms`,
      p99: `${percentiles.p99}ms`,
    });
  }

  /**
   * Calculate percentiles
   */
  private calculatePercentiles(values: number[]): { p50: number; p95: number; p99: number } {
    if (values.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const p50Index = Math.floor(sorted.length * 0.5);
    const p95Index = Math.floor(sorted.length * 0.95);
    const p99Index = Math.floor(sorted.length * 0.99);

    return {
      p50: sorted[p50Index],
      p95: sorted[p95Index],
      p99: sorted[p99Index],
    };
  }

  /**
   * Track cache hit rate
   */
  trackCacheHitRate(hits: number, misses: number): void {
    const total = hits + misses;
    this.metrics.cacheHitRate = total > 0 ? hits / total : 0;

    logger.info('Cache hit rate', {
      hits,
      misses,
      rate: `${(this.metrics.cacheHitRate * 100).toFixed(2)}%`,
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTracker();
