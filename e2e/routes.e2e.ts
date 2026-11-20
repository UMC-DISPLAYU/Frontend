import { expect, test } from '@playwright/test';

import { expectLoginModal, expectNotFound, expectPageTitle } from './support/screens';
import { loginAsMockUser } from './support/session';

test.describe('비로그인', () => {
  test('/ 는 검색어를 그대로 두고 /home 으로 보낸다', async ({ page }) => {
    await page.goto('/?mock=archive-empty');
    await expect(page).toHaveURL(/\/home\?mock=archive-empty$/);
  });

  const publicPages = [
    { path: '/search', title: '탐색' },
    { path: '/display/101', title: '[Soft Landing]' },
  ];
  for (const { path, title } of publicPages) {
    test(`공개 화면 ${path} 는 로그인 없이 열린다`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expectPageTitle(page, title);
    });
  }

  test('없는 주소는 404', async ({ page }) => {
    await page.goto('/no-such-page');
    await expectNotFound(page);
  });

  for (const path of ['/my', '/display-management', '/exhibition/101/work']) {
    test(`보호 화면 ${path} 는 로그인 모달을 띄운다`, async ({ page }) => {
      await page.goto(path);
      await expectLoginModal(page);
    });
  }

  test('로그인 모달에서 둘러보기를 누르면 홈으로 보낸다', async ({ page }) => {
    await page.goto('/my');
    await expectLoginModal(page);

    await page.getByRole('button', { name: '비회원으로 계속 둘러보기' }).click();
    await expect(page).toHaveURL(/\/home$/);
  });
});

test.describe('로그인', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMockUser(page);
  });

  const protectedPages = [
    { path: '/my', title: '마이' },
    { path: '/display-management', title: '내 전시 관리' },
    { path: '/exhibition/101/work', title: '전시 작업' },
    { path: '/exhibition/101/contents', title: '전시 작업' },
    { path: '/exhibition/101/edit', title: '전시 기본 정보' },
  ];
  for (const { path, title } of protectedPages) {
    test(`보호 화면 ${path} 가 열린다`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expectPageTitle(page, title);
    });
  }

  test('/my/exhibitions 는 /display-management 로 보낸다', async ({ page }) => {
    await page.goto('/my/exhibitions');
    await expect(page).toHaveURL(/\/display-management$/);
  });

  test('등록 단계 주소로 바로 들어오면 첫 단계로 보낸다', async ({ page }) => {
    await page.goto('/exhibition/register/artist');
    await expect(page).toHaveURL(/\/exhibition\/register$/);
  });
});

test.describe('전시 권한 가드', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMockUser(page);
  });

  test('팀원은 전시 콘텐츠 관리에 들어오면 404', async ({ page }) => {
    await page.goto('/exhibition/101/contents?mock=display-member');
    await expectNotFound(page);
  });

  test('팀원은 팀원 초대에 들어오면 전시 작업으로 보낸다', async ({ page }) => {
    await page.goto('/exhibition/101/team?mock=display-member');
    await expect(page).toHaveURL(/\/exhibition\/101\/work(\?.*)?$/);
    await expectPageTitle(page, '전시 작업');
  });
});

test.describe('전시 상세 · 미리보기', () => {
  test('공개된 전시의 미리보기 주소는 상세로 보내지 않는다(#626)', async ({ page }) => {
    await loginAsMockUser(page);
    await page.goto('/exhibition/101/preview');
    await expect(page).toHaveURL(/\/exhibition\/101\/preview$/);
    await expectPageTitle(page, '[Soft Landing]');
  });

  test('개막 전 전시는 상세에서 콘텐츠를 숨기고, 미리보기에서는 보인다(#630)', async ({ page }) => {
    await page.goto('/display/190');
    await expectPageTitle(page, '물성매력');
    await expect(page.getByRole('link', { name: '전시장 안내' })).toHaveCount(0);

    await loginAsMockUser(page);
    await page.goto('/exhibition/190/preview');
    await expectPageTitle(page, '물성매력');
    await expect(page.getByRole('link', { name: '전시장 안내' })).toBeVisible();
  });
});
