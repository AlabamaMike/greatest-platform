import { test, expect } from '@playwright/test';

test.describe('Crisis Response E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'crisis@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should report a new crisis incident', async ({ page }) => {
    // Navigate to crisis response
    await page.click('text=Crisis Response');
    await page.click('text=Report Incident');

    // Fill incident form
    await page.selectOption('select[name="type"]', 'flood');
    await page.selectOption('select[name="severity"]', 'high');
    await page.fill('textarea[name="description"]', 'Severe flooding in downtown area');

    // Set location (mock geolocation)
    await page.fill('input[name="latitude"]', '40.7128');
    await page.fill('input[name="longitude"]', '-74.0060');
    await page.fill('input[name="location"]', 'Downtown NYC');

    // Upload photos if needed
    // await page.setInputFiles('input[type="file"]', 'path/to/photo.jpg');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Incident reported')).toBeVisible();
    await expect(page.locator('text=under review')).toBeVisible();
  });

  test('should view crisis map with active incidents', async ({ page }) => {
    await page.click('text=Crisis Map');

    // Verify map loads
    await expect(page.locator('.map-container')).toBeVisible({ timeout: 10000 });

    // Verify incident markers
    await expect(page.locator('.incident-marker')).toHaveCount({ timeout: 5000 });

    // Click on an incident marker
    await page.locator('.incident-marker').first().click();

    // Verify incident details popup
    await expect(page.locator('.incident-popup')).toBeVisible();
    await expect(page.locator('text=Severity')).toBeVisible();
  });

  test('should register as a volunteer', async ({ page }) => {
    await page.click('text=Volunteers');
    await page.click('text=Register as Volunteer');

    // Fill volunteer form
    await page.fill('input[name="name"]', 'John Volunteer');
    await page.fill('input[name="email"]', 'john.volunteer@example.com');
    await page.fill('input[name="phone"]', '+1234567890');

    // Select skills
    await page.check('input[value="medical"]');
    await page.check('input[value="logistics"]');
    await page.check('input[value="translation"]');

    // Set availability
    await page.selectOption('select[name="availability"]', 'immediate');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Volunteer registered')).toBeVisible();
    await expect(page.locator('text=Thank you')).toBeVisible();
  });

  test('should deploy resources to an incident', async ({ page }) => {
    await page.click('text=Resources');

    // View available resources
    await expect(page.locator('text=Available Resources')).toBeVisible();

    // Select a resource
    await page.click('button.deploy-resource:first-of-type');

    // Select incident
    await page.selectOption('select[name="incident"]', 'incident-123');

    // Confirm deployment
    await page.click('text=Confirm Deployment');

    // Verify success
    await expect(page.locator('text=Resource deployed')).toBeVisible();
  });

  test('should create and view emergency alert', async ({ page }) => {
    await page.click('text=Alerts');
    await page.click('text=Create Alert');

    // Fill alert form
    await page.selectOption('select[name="type"]', 'earthquake');
    await page.selectOption('select[name="severity"]', 'severe');
    await page.fill('input[name="headline"]', 'Earthquake Warning');
    await page.fill('textarea[name="description"]', 'Magnitude 7.0 earthquake detected');

    // Set affected area
    await page.fill('input[name="area"]', 'San Francisco Bay Area');

    // Set expiration
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="expires"]', tomorrow.toISOString());

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Alert published')).toBeVisible();

    // Verify alert appears in list
    await page.click('text=All Alerts');
    await expect(page.locator('text=Earthquake Warning')).toBeVisible();
  });

  test('should view real-time incident updates via WebSocket', async ({ page }) => {
    await page.click('text=Live Updates');

    // Verify WebSocket connection indicator
    await expect(page.locator('text=Connected')).toBeVisible({ timeout: 5000 });

    // Wait for real-time updates
    await expect(page.locator('.update-item')).toHaveCount({ timeout: 10000 });
  });
});
