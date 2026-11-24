import { expect, type Page, test } from '@playwright/test';

import {
  fillDisplayRegisterFlow,
  POSTER,
  REGISTER_TODAY,
  SQUARE_POSTER,
} from './support/displayRegister';
import {
  ARTWORK_SQUARE,
  ARTWORK_WIDE,
  expectFitLook,
  expectWholeImage,
  hexToRgb,
  navigateInApp,
  uploadedImages,
} from './support/imageFit';
import { loginAsMockUser } from './support/session';

/*
 * 프로토타입 image-fit/poster(D안 11-16) · image-fit/work(11-17) 규칙을 목 서버에서 확인한다.
 * 포스터: 카드에 15% 넘게 잘리면 처음엔 전체 보이기, 남는 곳은 포스터 주조색(둘레 최빈색)
 * 작품: 3:4 카드에 30% 넘게 잘리면 처음엔 전체 보이기, 남는 곳은 목록 흰색 · 작품 상세 연한 회색
 * 사진을 올리면 보이는 방식은 자동 결과로 채워지고(썸네일 조정에서 바꿀 수 있다) 요청에 항상 실린다
 */

const SQUARE_POSTER_EDGE = '#2a6f97';

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(REGISTER_TODAY);
  await loginAsMockUser(page);
});

/** 내 전시 관리에서 등록하고 완료 화면 → 뒤로가기로 내 전시 관리 카드까지 온다. 보낸 요청 본문을 돌려준다 */
async function registerPoster(page: Page, options: Parameters<typeof fillDisplayRegisterFlow>[1]) {
  await page.goto('/display-management');
  await page
    .getByRole('button', { name: '전시 등록', exact: true })
    .or(page.getByRole('link', { name: '전시 등록', exact: true }))
    .first()
    .click();
  await fillDisplayRegisterFlow(page, options);

  const request = page.waitForRequest(
    (req) => req.method() === 'POST' && new URL(req.url()).pathname.endsWith('/v1/display'),
  );
  await page.getByRole('button', { name: '전시 준비하기' }).click();
  const body = (await request).postDataJSON() as { posterFit?: string; posterEdgeColor?: string };
  await expect(page).toHaveURL(/\/exhibition\/\d+\/created$/);
  const displayId = Number(page.url().match(/exhibition\/(\d+)\/created/)?.[1]);

  await page.goBack();
  await expect(page).toHaveURL(/\/display-management$/);
  return { body, displayId };
}

test.describe('전시 포스터', () => {
  test('정사각 포스터는 처음부터 전체 보이기, 남는 곳은 포스터 주조색', async ({ page }) => {
    const { body, displayId } = await registerPoster(page, { poster: SQUARE_POSTER });

    expect(body.posterFit).toBe('FIT');
    expect(body.posterEdgeColor).toBe(SQUARE_POSTER_EDGE);
    const look = { objectFit: 'contain', backgroundColor: hexToRgb(SQUARE_POSTER_EDGE) };
    await expectFitLook(uploadedImages(page).first(), look);

    // 전시 미리보기(상세와 같은 화면)의 포스터도 같다
    await navigateInApp(page, `/exhibition/${displayId}/preview`);
    await expectFitLook(uploadedImages(page).first(), look);
  });

  test('3:4 포스터는 처음부터 꽉 채우기', async ({ page }) => {
    const { body } = await registerPoster(page, { poster: POSTER });

    expect(body.posterFit).toBe('FILL');
    await expectFitLook(uploadedImages(page).first(), { objectFit: 'cover' });
  });

  test('정사각 포스터라도 꽉 채우기를 고르면 꽉 채우기', async ({ page }) => {
    const { body } = await registerPoster(page, { poster: SQUARE_POSTER, fit: '꽉 채우기' });

    expect(body.posterFit).toBe('FILL');
    await expectFitLook(uploadedImages(page).first(), { objectFit: 'cover' });
  });

  test('3:4 포스터라도 전체 보이기를 고르면 전체 보이기, 남는 곳은 그 포스터의 주조색', async ({
    page,
  }) => {
    const { body } = await registerPoster(page, { poster: POSTER, fit: '전체 보이기' });

    expect(body.posterFit).toBe('FIT');
    expect(body.posterEdgeColor).toMatch(/^#[0-9a-f]{6}$/);
    await expectFitLook(uploadedImages(page).first(), {
      objectFit: 'contain',
      backgroundColor: hexToRgb(body.posterEdgeColor!),
    });
  });
});

/** 101번 전시에 작품을 등록하고, 등록 뒤 화면에 머문다. 보낸 요청 본문을 돌려준다 */
async function registerArtwork(page: Page, image: string, fit?: '꽉 채우기' | '전체 보이기') {
  await page.goto('/exhibition/101/artworks/new');
  // 첫 번째 파일 입력이 작품 이미지, 두 번째가 작업 과정이다
  await page.locator('input[type=file]').first().setInputFiles(image);
  const adjust = page.getByLabel('대표 사진 썸네일 조정');
  await expect(adjust).toBeAttached();
  if (fit) {
    await adjust.click({ force: true });
    const sheet = page.locator('[role=dialog]', { hasText: '처음대로' });
    await sheet.getByRole('radio', { name: fit }).click();
    await sheet.getByRole('button', { name: '완료', exact: true }).click();
    await expect(sheet).toHaveCount(0);
  }
  await page.getByRole('textbox', { name: '작품명' }).fill('E2E 작품');
  await page.getByRole('group', { name: '작품분야' }).getByRole('button', { name: '회화' }).click();
  await page.getByRole('textbox', { name: '제작 연도' }).fill('2026');

  const response = page.waitForResponse(
    (res) =>
      res.request().method() === 'POST' && new URL(res.url()).pathname.endsWith('/v1/artworks'),
  );
  await page.getByRole('button', { name: '작품 등록', exact: true }).click();
  const created = await response;
  const body = created.request().postDataJSON() as { artworkFit?: string };
  expect(created.status()).toBe(201);
  // 등록 뒤 화면 이동이 끝난 다음에 다른 화면으로 옮긴다
  await page.waitForTimeout(1000);
  return body;
}

test.describe('작품 대표 사진', () => {
  test('가로 사진(30% 넘게 잘림)은 처음부터 전체 보이기, 목록은 흰색 · 작품 상세는 연한 회색', async ({
    page,
  }) => {
    const body = await registerArtwork(page, ARTWORK_WIDE);
    expect(body.artworkFit).toBe('FIT');

    await navigateInApp(page, '/display/101?tab=works');
    const card = uploadedImages(page).first();
    await expectFitLook(card, { objectFit: 'contain', backgroundColor: 'rgb(255, 255, 255)' });

    await card.click();
    await expect(page).toHaveURL(/\/artwork\/\d+/);
    // 작품 상세는 늘 사진 전체(자르지 않음)이고, 남는 곳은 연한 회색(#f4f4f5)이다
    await expectWholeImage(
      uploadedImages(page).filter({ visible: true }).first(),
      'rgb(244, 244, 245)',
    );
  });

  test('정사각 사진(25% 잘림)은 처음부터 꽉 채우기', async ({ page }) => {
    const body = await registerArtwork(page, ARTWORK_SQUARE);
    expect(body.artworkFit).toBe('FILL');

    await navigateInApp(page, '/display/101?tab=works');
    await expectFitLook(uploadedImages(page).first(), { objectFit: 'cover' });
  });

  test('가로 사진이라도 꽉 채우기를 고르면 꽉 채우기', async ({ page }) => {
    const body = await registerArtwork(page, ARTWORK_WIDE, '꽉 채우기');

    expect(body.artworkFit).toBe('FILL');
    await navigateInApp(page, '/display/101?tab=works');
    await expectFitLook(uploadedImages(page).first(), { objectFit: 'cover' });
  });

  test('대표가 영상인 작품을 수정하면 꽉 채우기를 보낸다', async ({ page }) => {
    // 목 1099번: 대표가 영상인 작품(videoSamples.ts)
    await page.goto('/exhibition/101/artworks/1099/edit');
    await expect(page.getByLabel('영상 썸네일 변경')).toBeAttached();

    const request = page.waitForRequest(
      (req) =>
        req.method() === 'PATCH' && /\/v1\/artworks\/1099$/.test(new URL(req.url()).pathname),
    );
    await page.getByRole('button', { name: '수정 완료', exact: true }).click();
    const body = (await request).postDataJSON() as { artworkFit?: string };
    expect(body.artworkFit).toBe('FILL');
  });

  test('수정에서 대표 사진을 가로 사진으로 바꾸면 새 사진 기준 보이는 방식을 보낸다', async ({
    page,
  }) => {
    await page.goto('/exhibition/101/artworks/1001/edit');
    const field = page.getByRole('group', { name: /^작품 이미지/ });
    await expect(field.getByRole('button', { name: '1번째 삭제' })).toBeVisible();
    const savedCount = await field.getByRole('button', { name: /번째 삭제$/ }).count();

    await page.locator('input[type=file]').first().setInputFiles(ARTWORK_WIDE);
    await expect(field.getByRole('button', { name: /번째 삭제$/ })).toHaveCount(savedCount + 1);
    // 저장돼 있던 사진을 모두 지워 새 가로 사진을 대표로 만든다
    for (let index = 0; index < savedCount; index += 1) {
      await field.getByRole('button', { name: '1번째 삭제' }).click();
    }
    await expect(field.getByRole('button', { name: /번째 삭제$/ })).toHaveCount(1);

    const request = page.waitForRequest(
      (req) =>
        req.method() === 'PATCH' && /\/v1\/artworks\/1001$/.test(new URL(req.url()).pathname),
    );
    await page.getByRole('button', { name: '수정 완료', exact: true }).click();
    const body = (await request).postDataJSON() as { artworkFit?: string };
    expect(body.artworkFit).toBe('FIT');
  });
});
