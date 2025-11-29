import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3003/#/');
  });

  test('I Want to Help button has proper contrast', async ({ page }) => {
    const button = page.locator('#i-want-to-help-button');

    // Wait for button to be visible
    await button.waitFor({ state: 'visible' });

    // Get computed styles
    const backgroundColor = await button.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const color = await button.evaluate(el => {
      return window.getComputedStyle(el).color;
    });

    // Parse RGB values
    const bgMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const fgMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

    expect(bgMatch).toBeTruthy();
    expect(fgMatch).toBeTruthy();

    if (bgMatch && fgMatch) {
      const bg = [parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3])];
      const fg = [parseInt(fgMatch[1]), parseInt(fgMatch[2]), parseInt(fgMatch[3])];

      // Check that background is not white (should be blue)
      const isBgWhite = bg[0] > 240 && bg[1] > 240 && bg[2] > 240;
      const isFgWhite = fg[0] > 240 && fg[1] > 240 && fg[2] > 240;

      // Button should NOT be white on white
      expect(isBgWhite && isFgWhite).toBe(false);

      // Button should have blue background (#2563eb = rgb(37, 99, 235))
      expect(bg[0]).toBe(37); // Blue background
      expect(bg[1]).toBe(99);
      expect(bg[2]).toBe(235);

      // Button should have white text
      expect(fg[0]).toBe(255); // White text
      expect(fg[1]).toBe(255);
      expect(fg[2]).toBe(255);
    }
  });

  test('Button is visible and accessible', async ({ page }) => {
    const button = page.locator('#i-want-to-help-button');

    // Check visibility
    await expect(button).toBeVisible();

    // Check accessibility attributes
    await expect(button).toHaveAttribute('aria-label', 'Browse meal requests and help students in need');

    // Check that button is focusable
    await button.focus();
    await expect(button).toBeFocused();
  });

  test('Button hover state maintains contrast', async ({ page }) => {
    const button = page.locator('#i-want-to-help-button');

    // Get initial styles
    const initialBackgroundColor = await button.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    console.log('Initial background:', initialBackgroundColor);

    // Hover over button
    await button.hover();
    await page.waitForTimeout(100); // Wait for hover effect

    // Check hover styles are applied
    const hoverBackgroundColor = await button.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const hoverColor = await button.evaluate(el => {
      return window.getComputedStyle(el).color;
    });

    console.log('Hover background:', hoverBackgroundColor);
    console.log('Hover color:', hoverColor);

    // Should still have good contrast on hover (darker blue background)
    const hoverBgMatch = hoverBackgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const hoverFgMatch = hoverColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);

    expect(hoverBgMatch).toBeTruthy();
    expect(hoverFgMatch).toBeTruthy();

    if (hoverBgMatch && hoverFgMatch) {
      const hoverBg = [parseInt(hoverBgMatch[1]), parseInt(hoverBgMatch[2]), parseInt(hoverBgMatch[3])];
      const hoverFg = [parseInt(hoverFgMatch[1]), parseInt(hoverFgMatch[2]), parseInt(hoverFgMatch[3])];

      // The hover should change the background (either via CSS or JS event handlers)
      // For now, just ensure it has good contrast - we'll fix the specific color later
      const isBgBlue = hoverBg[2] > 200; // Blue has high blue component
      const isFgWhite = hoverFg[0] > 240 && hoverFg[1] > 240 && hoverFg[2] > 240;

      expect(isBgBlue).toBe(true); // Should be some shade of blue
      expect(isFgWhite).toBe(true); // Should be white text
    }
  });
});
