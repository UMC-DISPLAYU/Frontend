import { expect, type Page } from '@playwright/test';

/** 목 로그인: 소셜 로그인에서 돌아온 것처럼 /home?accessToken= 으로 들어가 토큰을 저장한다 */
export async function loginAsMockUser(page: Page) {
  // 목 토큰 재발급(/auth/refresh)은 이 쿠키가 있어야 성공한다
  await page
    .context()
    .addCookies([
      { name: 'mock-refresh-token', value: 'mock-refresh-token', domain: 'localhost', path: '/' },
    ]);
  await page.goto('/home?accessToken=mock-access-token');
  await expect(page).toHaveURL(/\/home$/);
}
