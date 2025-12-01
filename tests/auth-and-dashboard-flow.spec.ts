import { test, expect } from '@playwright/test';

const randomEmail = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`;
};

// High-level smoke tests for student and donor journeys through the AuthModal
// and into their respective dashboards.

test.describe('Auth and dashboard flows', () => {
  test('Student registration and dashboard', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: "I'm a Student" }).click();

    // Switch to Register tab
    await page.getByRole('button', { name: 'Join (Verification)' }).click();

    const email = randomEmail('student');

    await page.getByLabel(/University Email|Email Address/).fill(email);
    await page.getByLabel('Mobile Number (No VoIP)').fill('(555) 123-4567');
    await page.getByLabel('Full Street Address').fill('123 Campus Dr');
    await page.getByLabel('City').fill('San Jose');
    await page.getByLabel('State/Prov').fill('CA');
    await page.getByLabel('Zip').fill('95112');

    await page.getByRole('button', { name: 'Verify Identity' }).click();

    await expect(page.getByText('Check Your Email')).toBeVisible();

    await page.getByRole('button', { name: '(Simulate) Click Link from Email' }).click();

    await expect(page).toHaveURL(/#\/dashboard-seeker$/);
    await expect(page.getByText('Active Requests')).toBeVisible();
  });

  test('Donor registration and dashboard', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'I Want to Donate' }).click();

    await page.getByRole('button', { name: 'Join (Verification)' }).click();

    const email = randomEmail('donor');

    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Mobile Number (No VoIP)').fill('(555) 987-6543');
    await page.getByLabel('Full Street Address').fill('456 Community Rd');
    await page.getByLabel('City').fill('San Jose');
    await page.getByLabel('State/Prov').fill('CA');
    await page.getByLabel('Zip').fill('95112');

    await page.getByRole('button', { name: 'Verify Identity' }).click();

    await expect(page.getByText('Check Your Email')).toBeVisible();

    await page.getByRole('button', { name: '(Simulate) Click Link from Email' }).click();

    await expect(page).toHaveURL(/#\/dashboard-donor$/);
    await expect(page.getByText('Active Offers')).toBeVisible();
  });
});
