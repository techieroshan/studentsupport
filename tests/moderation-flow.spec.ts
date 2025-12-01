import { test, expect } from '@playwright/test';

const randomEmail = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`;
};

// This test covers the moderation flow end-to-end:
// 1. Student registers and posts a request.
// 2. Donor registers and flags that request.
// 3. Admin logs in and sees the flag in the moderation queue, then dismisses it.

test.describe('Moderation flow (flagging and admin review)', () => {
  test('Student request is flagged by donor and reviewed by admin', async ({ page, context }) => {
    // 1. Student registers and posts a request
    await page.goto('/');

    await page.getByRole('button', { name: "I'm a Student" }).click();
    await page.getByRole('button', { name: 'Join (Verification)' }).click();

    const studentEmail = randomEmail('mod-student');

    await page
      .getByLabel(/University Email|Email Address/)
      .fill(studentEmail.endsWith('.edu') ? studentEmail : studentEmail.replace('@', '@university.edu'));
    await page.getByLabel('Mobile Number (No VoIP)').fill('(555) 555-0001');
    await page.getByLabel('Full Street Address').fill('901 Student Mod St');
    await page.getByLabel('City').fill('San Jose');
    await page.getByLabel('State/Prov').fill('CA');
    await page.getByLabel('Zip').fill('95112');

    await page.getByRole('button', { name: 'Verify Identity' }).click();
    await page.getByRole('button', { name: '(Simulate) Click Link from Email' }).click();

    await expect(page).toHaveURL(/#\/dashboard-seeker$/);

    await page.getByRole('button', { name: 'Request a Meal' }).click();
    await expect(page).toHaveURL(/#\/post-request$/);

    const description = `Request to be flagged - ${Date.now()}`;

    await page.getByLabel('Description').fill(description);
    await page
      .getByLabel('Availability / Timing Preference')
      .fill('Evenings after 6pm');
    await page.getByRole('button', { name: 'Vegan' }).click();
    await page.getByRole('button', { name: 'Pickup (Student travels)' }).click();
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /Post Request/ }).click();

    await expect(page).toHaveURL(/#\/dashboard-seeker$/);
    await expect(page.getByText(description)).toBeVisible();

    // 2. Donor registers and flags that request via Browse + Item detail
    const donorPage = await context.newPage();
    await donorPage.goto('/');

    await donorPage.getByRole('button', { name: 'I Want to Donate' }).click();
    await donorPage.getByRole('button', { name: 'Join (Verification)' }).click();

    const donorEmail = randomEmail('mod-donor');

    await donorPage.getByLabel('Email Address').fill(donorEmail);
    await donorPage
      .getByLabel('Mobile Number (No VoIP)')
      .fill('(555) 555-0002');
    await donorPage.getByLabel('Full Street Address').fill('902 Donor Mod Ave');
    await donorPage.getByLabel('City').fill('San Jose');
    await donorPage.getByLabel('State/Prov').fill('CA');
    await donorPage.getByLabel('Zip').fill('95112');

    await donorPage.getByRole('button', { name: 'Verify Identity' }).click();
    await donorPage
      .getByRole('button', { name: '(Simulate) Click Link from Email' })
      .click();

    await expect(donorPage).toHaveURL(/#\/dashboard-donor$/);

    await donorPage.getByRole('button', { name: 'Browse' }).click();
    await expect(donorPage).toHaveURL(/#\/browse$/);

    await expect(donorPage.getByText(description)).toBeVisible();
    await donorPage.getByText(description).click();

    await donorPage.getByRole('button', { name: /Report \/ Flag Transaction/ }).click();

    await donorPage.close();

    // 3. Admin logs in and reviews moderation queue
    const adminPage = await context.newPage();
    await adminPage.goto('/');

    await adminPage.getByRole('button', { name: 'I Want to Donate' }).click();
    // Use Login tab for existing admin account
    await adminPage.getByRole('button', { name: 'Log In' }).click();

    await adminPage.getByLabel('Email Address').fill('admin@newabilities.org');
    await adminPage.getByLabel('Password').fill('password');
    await adminPage.getByRole('button', { name: 'Log In' }).click();

    await expect(adminPage).toHaveURL(/#\/admin$/);

    await adminPage.getByRole('button', { name: /Moderation/ }).click();

    const moderationRow = adminPage.getByText(description).first();
    await expect(moderationRow).toBeVisible();

    await adminPage
      .getByRole('button', { name: /Keep \(Dismiss\)/ })
      .click();

    await expect(adminPage.getByText(description)).toHaveCount(0);
  });
});
