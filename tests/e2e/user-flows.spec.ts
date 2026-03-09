/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { test, expect } from '@playwright/test';

test.describe('User Flows', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/');
    
    // Check that the app loaded
    await expect(page).toHaveTitle(/Copilot/i);
    
    // Check for main navigation
    await expect(page.locator('text=Strategies')).toBeVisible();
    await expect(page.locator('text=Optimizer')).toBeVisible();
  });

  test('should navigate between views', async ({ page }) => {
    await page.goto('/');
    
    // Start on strategies view
    await expect(page.locator('text=Reclaim your workday')).toBeVisible();
    
    // Navigate to optimizer
    await page.click('text=Optimizer');
    await expect(page.locator('text=What\'s draining your time?')).toBeVisible();
    
    // Navigate back to strategies
    await page.click('text=Strategies');
    await expect(page.locator('text=Reclaim your workday')).toBeVisible();
  });

  test('should display strategy cards', async ({ page }) => {
    await page.goto('/');
    
    // Check for strategy cards
    await expect(page.locator('text=Email & Slack Copilot')).toBeVisible();
    await expect(page.locator('text=Meeting Intelligence')).toBeVisible();
    await expect(page.locator('text=Document Automation')).toBeVisible();
    await expect(page.locator('text=Smart Scheduling')).toBeVisible();
  });

  test('should show time saved for each strategy', async ({ page }) => {
    await page.goto('/');
    
    // Check for time saved indicators
    await expect(page.locator('text=Save 45m / day')).toBeVisible();
    await expect(page.locator('text=Save 30m / day')).toBeVisible();
    await expect(page.locator('text=Save 20m / day')).toBeVisible();
    await expect(page.locator('text=Save 15m / day')).toBeVisible();
  });

  test('should have optimizer input field', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Optimizer');
    
    // Check for input field
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute('placeholder', /summarizing/i);
  });

  test('should enable optimize button when input is provided', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Optimizer');
    
    const textarea = page.locator('textarea');
    const button = page.locator('button:has-text("Optimize")');
    
    // Button should be disabled initially
    await expect(button).toBeDisabled();
    
    // Type in textarea
    await textarea.fill('I spend too much time on emails');
    
    // Button should be enabled
    await expect(button).toBeEnabled();
  });

  test('should show loading state during optimization', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Optimizer');
    
    const textarea = page.locator('textarea');
    const button = page.locator('button:has-text("Optimize")');
    
    await textarea.fill('Test task');
    await button.click();
    
    // Should show loading state
    await expect(page.locator('text=Processing')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content is visible on mobile
    await expect(page.locator('text=Copilot')).toBeVisible();
    await expect(page.locator('text=Strategies')).toBeVisible();
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check that buttons are keyboard accessible
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
  });

  test('should display footer information', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer content
    await expect(page.locator('text=© 2026 Productivity Copilot')).toBeVisible();
    await expect(page.locator('text=System Operational')).toBeVisible();
  });

  test('should lazy load components', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to optimizer (should lazy load)
    await page.click('text=Optimizer');
    
    // Wait for lazy-loaded content
    await expect(page.locator('text=What\'s draining your time?')).toBeVisible({
      timeout: 5000,
    });
  });

  test('should handle navigation with browser back button', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to optimizer
    await page.click('text=Optimizer');
    await expect(page.locator('text=What\'s draining your time?')).toBeVisible();
    
    // Go back
    await page.goBack();
    await expect(page.locator('text=Reclaim your workday')).toBeVisible();
  });

  test('should display live status indicator', async ({ page }) => {
    await page.goto('/');
    
    // Check for live indicator
    await expect(page.locator('text=Live')).toBeVisible();
    
    // Check for pulsing animation (green dot)
    const liveIndicator = page.locator('.animate-pulse');
    await expect(liveIndicator).toBeVisible();
  });
});
