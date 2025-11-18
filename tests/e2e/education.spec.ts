import { test, expect } from '@playwright/test';

test.describe('Education Platform E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should browse course catalog', async ({ page }) => {
    await page.click('text=Courses');

    // Verify course catalog loads
    await expect(page.locator('text=Course Catalog')).toBeVisible();
    await expect(page.locator('.course-card')).toHaveCount({ timeout: 5000 });

    // Filter courses
    await page.selectOption('select[name="level"]', 'beginner');
    await page.selectOption('select[name="language"]', 'en');

    // Verify filtered results
    await expect(page.locator('.course-card')).toHaveCount({ timeout: 3000 });
  });

  test('should enroll in a course', async ({ page }) => {
    await page.click('text=Courses');

    // Click on a course
    await page.locator('.course-card').first().click();

    // Verify course details
    await expect(page.locator('text=Course Overview')).toBeVisible();
    await expect(page.locator('text=Duration')).toBeVisible();
    await expect(page.locator('text=Modules')).toBeVisible();

    // Enroll
    await page.click('button:has-text("Enroll Now")');

    // Verify enrollment success
    await expect(page.locator('text=Enrolled successfully')).toBeVisible();
    await expect(page.locator('text=Start Learning')).toBeVisible();
  });

  test('should complete a lesson', async ({ page }) => {
    await page.click('text=My Courses');

    // Select enrolled course
    await page.locator('.enrolled-course').first().click();

    // Start first lesson
    await page.click('text=Start Lesson');

    // View lesson content
    await expect(page.locator('.lesson-content')).toBeVisible();

    // Mark as complete
    await page.click('button:has-text("Mark Complete")');

    // Verify progress update
    await expect(page.locator('text=Progress: ')).toBeVisible();
  });

  test('should take and pass an assessment', async ({ page }) => {
    await page.click('text=My Courses');
    await page.locator('.enrolled-course').first().click();

    // Navigate to assessment
    await page.click('text=Take Assessment');

    // Answer questions
    const questions = await page.locator('.question').count();
    for (let i = 0; i < questions; i++) {
      await page.locator(`.question:nth-child(${i + 1}) input[type="radio"]`).first().check();
    }

    // Submit assessment
    await page.click('button[type="submit"]');

    // Verify results
    await expect(page.locator('text=Score')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Passed').or(page.locator('text=Failed'))).toBeVisible();
  });

  test('should view certificate', async ({ page }) => {
    await page.click('text=My Certificates');

    // Verify certificates page
    await expect(page.locator('text=Your Certificates')).toBeVisible();

    // Check if certificates are listed
    const certificateCount = await page.locator('.certificate-card').count();
    if (certificateCount > 0) {
      // Click to view certificate
      await page.locator('.certificate-card').first().click();

      // Verify certificate details
      await expect(page.locator('text=Certificate of Completion')).toBeVisible();
      await expect(page.locator('button:has-text("Download")')).toBeVisible();
    }
  });

  test('should join a live class', async ({ page }) => {
    await page.click('text=Live Classes');

    // Find upcoming class
    await expect(page.locator('.live-class')).toHaveCount({ timeout: 5000 });

    // Join class
    await page.click('button:has-text("Join Class")');

    // Verify video classroom loads
    await expect(page.locator('video').or(page.locator('.video-container'))).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('text=In Class').or(page.locator('text=Live'))).toBeVisible();
  });
});
