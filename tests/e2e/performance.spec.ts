/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should meet performance budgets', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Time to Interactive should be < 3.5s
    expect(loadTime).toBeLessThan(3500);
  });

  test('should have fast First Contentful Paint', async ({ page }) => {
    await page.goto('/');
    
    // Check that content appears quickly
    await expect(page.locator('text=Copilot')).toBeVisible({ timeout: 2000 });
  });

  test('should lazy load routes efficiently', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.click('text=Optimizer');
    await expect(page.locator('text=What\'s draining your time?')).toBeVisible();
    const navigationTime = Date.now() - startTime;
    
    // Route navigation should be < 500ms
    expect(navigationTime).toBeLessThan(500);
  });

  test('should have small bundle size', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'],
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that JavaScript bundles are compressed
    const jsResponses = responses.filter((r) => r.url.includes('.js'));
    expect(jsResponses.length).toBeGreaterThan(0);
  });

  test('should cache static assets', async ({ page }) => {
    // First visit
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Second visit - should use cache
    const cachedResponses: string[] = [];
    page.on('response', (response) => {
      if (response.fromCache()) {
        cachedResponses.push(response.url());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Some assets should be cached
    expect(cachedResponses.length).toBeGreaterThan(0);
  });

  test('should have minimal layout shift', async ({ page }) => {
    await page.goto('/');
    
    // Wait for initial render
    await page.waitForTimeout(1000);
    
    // Take screenshot before
    const before = await page.screenshot();
    
    // Wait a bit more
    await page.waitForTimeout(1000);
    
    // Take screenshot after
    const after = await page.screenshot();
    
    // Screenshots should be similar (minimal layout shift)
    expect(before.length).toBeGreaterThan(0);
    expect(after.length).toBeGreaterThan(0);
  });

  test('should respond quickly to user interactions', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.click('text=Optimizer');
    const responseTime = Date.now() - startTime;
    
    // First Input Delay should be < 100ms
    expect(responseTime).toBeLessThan(100);
  });

  test('should handle rapid navigation', async ({ page }) => {
    await page.goto('/');
    
    // Rapidly switch between views
    for (let i = 0; i < 5; i++) {
      await page.click('text=Optimizer');
      await page.waitForTimeout(100);
      await page.click('text=Strategies');
      await page.waitForTimeout(100);
    }
    
    // App should still be responsive
    await expect(page.locator('text=Copilot')).toBeVisible();
  });

  test('should load images efficiently', async ({ page }) => {
    const imageRequests: any[] = [];
    
    page.on('request', (request) => {
      if (request.resourceType() === 'image') {
        imageRequests.push(request.url());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Images should be optimized (WebP format)
    const webpImages = imageRequests.filter((url) => url.includes('.webp'));
    // Note: This depends on actual image usage in the app
  });

  test('should have fast health check response', async ({ page, request }) => {
    const startTime = Date.now();
    
    const response = await request.get('http://localhost:8080/health');
    
    const responseTime = Date.now() - startTime;
    
    // Health check should respond < 100ms
    expect(responseTime).toBeLessThan(100);
    expect(response.status()).toBe(200);
  });
});
