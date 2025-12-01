import { test, expect, Page } from '@playwright/test';

const expectHash = async (page: Page, expectedHash: string) => {
  await expect(page).toHaveURL((url) => url.hash === expectedHash);
};

// These tests exercise the navigation/routing rules described in ROUTING_TEST_SPEC.md.

test.describe('Routing', () => {
  test('TC-1: URL updates when clicking Browse from home', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Browse Requests' }).click();

    await expectHash(page, '#/browse');
    await expect(page.getByText('Browse Meals')).toBeVisible();
  });

  test('TC-2: Direct navigation to browse', async ({ page }) => {
    await page.goto('/#/browse');

    await expect(page.getByText('Browse Meals')).toBeVisible();
    await expectHash(page, '#/browse');
  });

  test('TC-3: Navbar menu items navigate correctly and back/forward works', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'How It Works' }).click();
    await expectHash(page, '#/how-it-works');

    await page.getByRole('button', { name: 'FAQ' }).click();
    // FAQ is an in-page section on the home route
    await expectHash(page, '#/');
    await expect(page.locator('#faq')).toBeVisible();

    await page.getByRole('button', { name: 'Donors' }).click();
    await expectHash(page, '#/donors');

    await page.getByRole('button', { name: 'Browse' }).click();
    await expectHash(page, '#/browse');

    await page.goBack();
    await expectHash(page, '#/donors');

    await page.goForward();
    await expectHash(page, '#/browse');
  });

  test('TC-4: Browse page displays map', async ({ page }) => {
    await page.goto('/#/browse');

    const map = page.locator('.leaflet-container');
    await expect(map).toBeVisible();

    await map.click({ position: { x: 50, y: 50 } });
  });

  test('TC-6: Login buttons open auth modal without changing URL', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: "I'm a Student" }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expectHash(page, '#/');

    await page.keyboard.press('Escape');
    await expect(page.getByText('Welcome Back')).toHaveCount(0);

    await page.getByRole('button', { name: 'I Want to Donate' }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();
    await expectHash(page, '#/');
  });

  test('TC-7: Logout returns to home', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: "I'm a Student" }).click();

    // Use seeded demo student account from backend
    await page.getByLabel('Email Address').fill('student@university.edu');
    await page.getByLabel('Password').fill('password');
    await page.getByRole('button', { name: 'Log In' }).click();

    await expectHash(page, '#/dashboard-seeker');
    await expect(page.getByText('Active Requests')).toBeVisible();

    await page.getByRole('button', { name: 'Logout' }).click();

    await expectHash(page, '#/');
    await expect(page.getByText('Share a Meal, Fuel a Future.')).toBeVisible();
  });
});
