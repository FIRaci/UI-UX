import { test, expect } from '@playwright/test';

test.describe('Chatbot AI Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.route('**/api/auth/login', async route => {
      await route.fulfill({ json: { success: true, token: "mock-token" } });
    });
    await page.getByText('Tôi là Bệnh nhân').click();
  });

  test('should open chatbot and display welcome message', async ({ page }) => {
    await page.getByText('Trò chuyện với AI ngay').click();
    await expect(page.getByText('Xin chào! Tôi là trợ lý sức khỏe AI')).toBeVisible();
    await expect(page.getByText('Tôi bị đau đầu')).toBeVisible();
  });

  test('should allow typing and receiving AI response', async ({ page }) => {
    await page.getByText('Trò chuyện với AI ngay').click();
    const textarea = page.getByPlaceholder('Mô tả triệu chứng hoặc đặt câu hỏi...');
    await page.route('**/api/chat', async route => {
      await route.fulfill({ json: { text: "Mocked AI Response: Đau đầu do căng thẳng", actions: [] } });
    });
    
    await textarea.fill('Tôi bị đau đầu');
    await page.keyboard.press('Enter');
    await expect(page.getByText('Mocked AI Response: Đau đầu do căng thẳng')).toBeVisible({ timeout: 5000 });
  });
});
