import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the login screen with all roles', async ({ page }) => {
    await expect(page.getByText('Chăm sóc sức khỏe')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Đăng nhập', exact: true })).toBeVisible();
    await expect(page.getByText('Tôi là Bệnh nhân')).toBeVisible();
    await expect(page.getByText('Bác sĩ').first()).toBeVisible();
    await expect(page.getByText('Quản lý phòng khám')).toBeVisible();
  });

});
