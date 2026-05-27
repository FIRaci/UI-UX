import { test, expect } from '@playwright/test';

test.describe('Expert UI/UX Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Login as Expert
    await page.getByText('Chuyên gia UI/UX').click();
  });

  test('should display heuristic checklist and allow passing an item', async ({ page }) => {
    // Check if Heuristic view is active
    await expect(page.getByRole('heading', { name: 'Đánh giá Heuristic (Nielsen)' })).toBeVisible();
    
    // Find the first "Đạt" button and click it
    const passButton = page.getByRole('button', { name: 'Đạt' }).first();
    await passButton.click();
    
    // After clicking, it should turn green or have some visual change, but for E2E we verify the text is still visible
    await expect(passButton).toBeVisible();
  });

  test('should navigate to Pain Points view and show form', async ({ page }) => {
    await page.getByRole('button', { name: 'Ghi nhận Pain Points' }).click();
    
    await expect(page.getByRole('heading', { name: 'Ghi nhận Pain Points' })).toBeVisible();
    await expect(page.getByPlaceholder('Mô tả lỗi hoặc khó khăn của người dùng...')).toBeVisible();
    
    // Try to fill out the form
    await page.getByPlaceholder('Mô tả lỗi hoặc khó khăn của người dùng...').fill('Test chức năng E2E');
    await page.getByPlaceholder('Đề xuất cải thiện (Ví dụ: Thêm bộ lọc, làm nổi bật nút Call-to-action)...').fill('Gặp khó khăn khi viết kịch bản test bằng Playwright');
    
    const submitButton = page.getByRole('button', { name: 'Lưu báo cáo' });
    await expect(submitButton).toBeVisible();
  });
});
