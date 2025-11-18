import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register a new user', async ({ page }) => {
    // Navigate to registration page
    await page.click('text=Sign Up');

    // Fill registration form
    const timestamp = Date.now();
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phone"]', '+1234567890');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should login with existing credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign In');

    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Sign In');

    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'WrongPassword');

    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('text=Invalid')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL(/dashboard/);

    // Logout
    await page.click('button[aria-label="User menu"]');
    await page.click('text=Logout');

    // Verify redirect to home
    await expect(page).toHaveURL('/');
  });
});
