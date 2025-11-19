import { test, expect } from '@playwright/test';

test.describe('Healthcare Service E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'healthcare@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should book a telemedicine appointment', async ({ page }) => {
    // Navigate to appointments
    await page.click('text=Appointments');

    // Click book appointment
    await page.click('text=Book Appointment');

    // Fill appointment form
    await page.selectOption('select[name="appointmentType"]', 'consultation');
    await page.selectOption('select[name="provider"]', 'dr-smith');

    // Select date and time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.fill('input[name="date"]', tomorrow.toISOString().split('T')[0]);
    await page.selectOption('select[name="time"]', '10:00');

    // Add notes
    await page.fill('textarea[name="notes"]', 'Regular checkup needed');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Appointment booked')).toBeVisible();
    await expect(page.locator('text=Confirmation')).toBeVisible();
  });

  test('should view appointment history', async ({ page }) => {
    await page.click('text=Appointments');
    await page.click('text=History');

    // Verify appointments list is visible
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount({ timeout: 5000 });
  });

  test('should start a telemedicine consultation', async ({ page }) => {
    await page.click('text=Consultations');
    await page.click('text=Start Consultation');

    // Select patient
    await page.selectOption('select[name="patient"]', 'patient-123');

    // Enter symptoms
    await page.fill('textarea[name="symptoms"]', 'Headache and fever');

    // Start video call
    await page.click('text=Start Video Call');

    // Verify video interface loads
    await expect(page.locator('video')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=In Call')).toBeVisible();
  });

  test('should view patient medical records', async ({ page }) => {
    await page.click('text=Patients');

    // Search for patient
    await page.fill('input[name="search"]', 'John Doe');
    await page.press('input[name="search"]', 'Enter');

    // Click on patient
    await page.click('text=John Doe');

    // Verify medical records
    await expect(page.locator('text=Medical History')).toBeVisible();
    await expect(page.locator('text=Prescriptions')).toBeVisible();
    await expect(page.locator('text=Lab Results')).toBeVisible();
  });

  test('should register a new patient', async ({ page }) => {
    await page.click('text=Patients');
    await page.click('text=Add Patient');

    // Fill patient form
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Smith');
    await page.fill('input[name="dateOfBirth"]', '1995-06-15');
    await page.selectOption('select[name="gender"]', 'female');
    await page.fill('input[name="phone"]', '+1987654321');
    await page.fill('input[name="email"]', 'jane.smith@example.com');

    // Submit
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=Patient registered')).toBeVisible();
  });
});
