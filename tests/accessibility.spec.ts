import { test, expect } from '@playwright/test';

// Accessibility checks for the "I Want to Help" CTA on the home page
// Uses Playwright baseURL from playwright.config.ts so we avoid hard-coded ports.

test.describe('Accessibility - I Want to Help button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('button has proper contrast and colors', async ({ page }) => {
    const button = page.locator('#i-want-to-help-button');
    await button.waitFor({ state: 'visible' });

    const backgroundColor = await button.evaluate((el) => {
      const element = el as HTMLElement;
      return window.getComputedStyle(element).backgroundColor;
    });

    const color = await button.evaluate((el) => {
      const element = el as HTMLElement;
      return window.getComputedStyle(element).color;
    });

    const bgMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const fgMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

    expect(bgMatch).not.toBeNull();
    expect(fgMatch).not.toBeNull();

    if (bgMatch && fgMatch) {
      const bg = [parseInt(bgMatch[1], 10), parseInt(bgMatch[2], 10), parseInt(bgMatch[3], 10)];
      const fg = [parseInt(fgMatch[1], 10), parseInt(fgMatch[2], 10), parseInt(fgMatch[3], 10)];

      const isBgWhite = bg[0] > 240 && bg[1] > 240 && bg[2] > 240;
      const isFgWhite = fg[0] > 240 && fg[1] > 240 && fg[2] > 240;

      // Button should NOT be white on white
      expect(isBgWhite && isFgWhite).toBe(false);

      // Button should have blue background (#2563eb = rgb(37, 99, 235))
      expect(bg[0]).toBe(37);
      expect(bg[1]).toBe(99);
      expect(bg[2]).toBe(235);

      // Button should have white text
      expect(fg[0]).toBe(255);
      expect(fg[1]).toBe(255);
      expect(fg[2]).toBe(255);
    }
  });

  test('button is visible and accessible', async ({ page }) => {
    const button = page.locator('#i-want-to-help-button');

    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute(
      'aria-label',
      'Browse meal requests and help students in need',
    );

    await button.focus();
    await expect(button).toBeFocused();
  });
});
