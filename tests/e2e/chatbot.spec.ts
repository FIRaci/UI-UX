import { test, expect } from '@playwright/test';

test.describe('Chatbot AI Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByText('Chuyên gia UI/UX').click();
  });

  test('should open chatbot and display expert suggestions', async ({ page }) => {
    await page.getByText('Chat AI').first().click();
    await expect(page.getByText('Xin chào chuyên gia')).toBeVisible();
    await expect(page.getByText('Phân tích điểm đau')).toBeVisible();
    await expect(page.getByText('Cảnh báo bất thường').first()).toBeVisible();
  });

  test('should allow typing and receiving AI response', async ({ page }) => {
    await page.getByText('Chat AI').first().click();
    const textarea = page.getByPlaceholder('Nhap tin nhan...');
    await textarea.fill('Phân tích UI');
    await page.keyboard.press('Enter');
    await expect(page.getByText(/Cảm ơn chuyên gia/)).toBeVisible({ timeout: 5000 });
  });
});
