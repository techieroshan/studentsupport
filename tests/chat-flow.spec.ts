import { test, expect } from '@playwright/test';

const randomEmail = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`;
};

// This test exercises the chat surface: student connects to a donor offer,
// opens the ChatModal, and successfully sends a message.

test.describe('Chat flow between student and donor', () => {
  test('Student connects to a donor offer and sends a chat message', async ({ page, context }) => {
    // 1. Donor registers and posts an offer
    await page.goto('/');

    await page.getByRole('button', { name: 'I Want to Donate' }).click();
    await page.getByRole('button', { name: 'Join (Verification)' }).click();

    const donorEmail = randomEmail('chat-donor');

    await page.getByLabel('Email Address').fill(donorEmail);
    await page.getByLabel('Mobile Number (No VoIP)').fill('(555) 222-3333');
    await page.getByLabel('Full Street Address').fill('100 Donor Way');
    await page.getByLabel('City').fill('San Jose');
    await page.getByLabel('State/Prov').fill('CA');
    await page.getByLabel('Zip').fill('95112');

    await page.getByRole('button', { name: 'Verify Identity' }).click();
    await page.getByRole('button', { name: '(Simulate) Click Link from Email' }).click();

    await expect(page).toHaveURL(/#\/dashboard-donor$/);

    await page.getByRole('button', { name: 'Donate Meal' }).click();
    await expect(page).toHaveURL(/#\/post-offer$/);

    const offerDescription = `Chat test offer - ${Date.now()}`;

    await page.getByLabel('Description').fill(offerDescription);
    await page
      .getByLabel('Availability / Timing Preference')
      .fill('Tonight after 7pm');

    await page.getByRole('button', { name: 'Vegan' }).click();
    await page.getByRole('button', { name: 'Pickup (Student travels)' }).click();

    await page.getByRole('button', { name: /Post Meal Offer/ }).click();

    await expect(page).toHaveURL(/#\/dashboard-donor$/);
    await expect(page.getByText(offerDescription)).toBeVisible();

    // 2. Student registers in a separate browser page
    const studentPage = await context.newPage();
    await studentPage.goto('/');

    await studentPage.getByRole('button', { name: "I'm a Student" }).click();
    await studentPage.getByRole('button', { name: 'Join (Verification)' }).click();

    const studentEmail = randomEmail('chat-student');

    await studentPage
      .getByLabel(/University Email|Email Address/)
      .fill(studentEmail.endsWith('.edu') ? studentEmail : studentEmail.replace('@', '@university.edu'));
    await studentPage
      .getByLabel('Mobile Number (No VoIP)')
      .fill('(555) 444-5555');
    await studentPage
      .getByLabel('Full Street Address')
      .fill('200 Student Ave');
    await studentPage.getByLabel('City').fill('San Jose');
    await studentPage.getByLabel('State/Prov').fill('CA');
    await studentPage.getByLabel('Zip').fill('95112');

    await studentPage.getByRole('button', { name: 'Verify Identity' }).click();
    await studentPage
      .getByRole('button', { name: '(Simulate) Click Link from Email' })
      .click();

    await expect(studentPage).toHaveURL(/#\/dashboard-seeker$/);

    // 3. Student navigates to Browse and opens the donor's offer
    await studentPage.getByRole('button', { name: 'Find Food Nearby' }).click();
    await expect(studentPage).toHaveURL(/#\/browse$/);

    // Wait for the offer to appear in the browse list
    await expect(studentPage.getByText(offerDescription)).toBeVisible();

    // Click the card to open ItemDetailModal
    await studentPage.getByText(offerDescription).click();

    // Click the primary action (Connect & Claim) which opens ChatModal
    await studentPage
      .getByRole('button', { name: /Connect & Claim|Offer Support|Login to Respond/ })
      .click();

    // 4. In ChatModal, send a message
    const chatInput = studentPage.getByPlaceholder('Type a message...');
    await chatInput.fill('Hi there! Is this meal still available?');

    await studentPage.getByRole('button', { name: /send/i }).click({ force: true }).catch(() => {
      // Fallback: submit via Enter if the icon button is not labelled
      return chatInput.press('Enter');
    });

    // Assert that our message appears in the conversation (right-aligned bubble)
    await expect(
      studentPage.getByText('Hi there! Is this meal still available?').first(),
    ).toBeVisible();

    // System safety tip should also be present
    await expect(
      studentPage.getByText('Safety Tip: Coordinate pickup locations in public areas.', {
        exact: false,
      }),
    ).toBeVisible();
  });
});
