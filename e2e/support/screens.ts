import { expect, type Page } from '@playwright/test';

export const expectPageTitle = (page: Page, title: string) =>
  expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();

export const expectNotFound = (page: Page) => expectPageTitle(page, '페이지를 찾을 수 없어요');

export const expectLoginModal = (page: Page) =>
  expect(page.getByRole('dialog').getByText('로그인이 필요해요')).toBeVisible();
