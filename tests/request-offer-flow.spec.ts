import { test, expect } from '@playwright/test';

const randomEmail = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`;
};

// This focuses on ensuring the main request/offer flows are wired end-to-end
// between frontend and backend: posting via UI and seeing the items reflected
// in dashboards and the public Browse view.

test.describe('Request and offer posting flows', () => {
  test('Student posts a request and sees it in dashboard and browse', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: "I'm a Student" }).click();
    await page.getByRole('button', { name: 'Join (Verification)' }).click();

    const email = randomEmail('student-req');

    await page.getByLabel(/University Email|Email Address/).fill(email);
    await page.getByLabel('Mobile Number (No VoIP)').fill('(555) 111-2222');
    await page.getByLabel('Full Street Address').fill('789 Dorm St');
    await page.getByLabel('City').fill('San Jose');
    await page.getByLabel('State/Prov').fill('CA');
    await page.getByLabel('Zip').fill('95112');

    await page.getByRole('button', { name: 'Verify Identity' }).click();
    await page.getByRole('button', { name: '(Simulate) Click Link from Email' }).click();

    await expect(page).toHaveURL(/#\/dashboard-seeker$/);

    await page.getByRole('button', { name: 'Request a Meal' }).click();
    await expect(page).toHaveURL(/#\/post-request$/);

    const description = `Need a healthy vegan dinner - ${Date.now()}`;

    await page.getByLabel('Description').fill(description);
    await page.getByLabel('Availability / Timing Preference').fill('Evenings after 6pm');

    await page.getByRole('button', { name: 'Vegan' }).click();
    await page.getByRole('button', { name: 'Pickup (Student travels)' }).click();

    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /Post Request/ }).click();

    await expect(page).toHaveURL(/#\/dashboard-seeker$/);
    await expect(page.getByText(description)).toBeVisible();

    await page.getByRole('button', { name: 'Find Food Nearby' }).click();

    await expect(page).toHaveURL(/#\/browse$/);
    await expect(page.getByText(description)).toBeVisible();
  });

  test('Donor posts an offer and sees it in dashboard and browse', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'I Want to Donate' }).click();
    await page.getByRole('button', { name: 'Join (Verification)' }).click();

    const email = randomEmail('donor-offer');

    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Mobile Number (No VoIP)').fill('(555) 333-4444');
    await page.getByLabel('Full Street Address').fill('321 Giving Ln');
    await page.getByLabel('City').fill('San Jose');
    await page.getByLabel('State/Prov').fill('CA');
    await page.getByLabel('Zip').fill('95112');

    await page.getByRole('button', { name: 'Verify Identity' }).click();
    await page.getByRole('button', { name: '(Simulate) Click Link from Email' }).click();

    await expect(page).toHaveURL(/#\/dashboard-donor$/);

    await page.getByRole('button', { name: 'Donate Meal' }).click();
    await expect(page).toHaveURL(/#\/post-offer$/);

    const description = `Homemade vegan curry - ${Date.now()}`;

    await page.getByLabel('Description').fill(description);
    await page.getByLabel('Availability / Timing Preference').fill('Tonight after 7pm');

    await page.getByRole('button', { name: 'Vegan' }).click();
    await page.getByRole('button', { name: 'Pickup (Student travels)' }).click();

    await page.getByRole('button', { name: /Post Meal Offer/ }).click();

    await expect(page).toHaveURL(/#\/dashboard-donor$/);
    await expect(page.getByText(description)).toBeVisible();

    await page.getByRole('button', { name: 'Browse' }).click();
    await expect(page).toHaveURL(/#\/browse$/);
    await expect(page.getByText(description)).toBeVisible();
  });
});
