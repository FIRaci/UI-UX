import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the login screen with all roles', async ({ page }) => {
    await expect(page.getByText('Chăm sóc sức khỏe')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible();
    await expect(page.getByText('Người cần khám bệnh')).toBeVisible();
    await expect(page.getByText('Bác sĩ').first()).toBeVisible();
    await expect(page.getByText('Chuyên gia UI/UX')).toBeVisible();
  });

  test('should allow clicking a role to login quickly', async ({ page }) => {
    // Click on Chuyên gia UI/UX role
    await page.getByText('Chuyên gia UI/UX').click();
    
    // Check if the dashboard is rendered (we assume Expert Dashboard shows up)
    await expect(page.getByText('Trung tâm Kiểm thử UI/UX')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Đánh giá Heuristic (Nielsen)' })).toBeVisible();
  });
});
