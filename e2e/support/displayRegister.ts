import { fileURLToPath } from 'node:url';

import { expect, type Page } from '@playwright/test';

const fixture = (name: string) => fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url));

/** 3:4 포스터. 썸네일 조정을 열어도 기본 범위가 전체라 범위를 보내지 않는다 */
export const POSTER = fixture('poster.png');
/** 900×800 포스터. 3:4 로 자르면 범위 값이 소수점 아래로 길어진다 */
export const WIDE_POSTER = fixture('poster-wide.png');
/** 800×800 포스터. 둘레가 주조색(#2a6f97)이고, 카드(402:568)에 29% 잘려 처음엔 전체 보이기 */
export const SQUARE_POSTER = fixture('poster-square.png');

/** 달력은 오늘 이전 날짜를 막으므로, 이 날짜로 시계를 고정한 뒤 같은 달 안에서 고른다 */
export const REGISTER_TODAY = new Date('2026-11-10T10:00:00+09:00');

type FillOptions = {
  poster?: string;
  /** 썸네일 조정에서 범위를 줄이고 옮겨 posterCrop 을 보내게 한다 */
  moveCrop?: boolean;
  /** 썸네일 조정에서 보이는 방식을 직접 고른다 */
  fit?: '꽉 채우기' | '전체 보이기';
};

/** 등록 1/2 · 2/2 · 작가명을 채우고 '전시 준비하기'를 누르기 직전까지 간다 */
export async function fillDisplayRegisterFlow(
  page: Page,
  { poster = POSTER, moveCrop = false, fit }: FillOptions = {},
) {
  await expect(page).toHaveURL(/\/exhibition\/register$/);

  // 1/2 소개
  await page.locator('input[type=file]').first().setInputFiles(poster);
  // 대표 포스터 조정 칩은 업로드가 끝난 뒤에 붙는다
  const adjust = page.getByLabel('대표 포스터 썸네일 조정');
  await expect(adjust).toBeAttached();

  if (fit) {
    await adjust.click({ force: true });
    const sheet = page.locator('[role=dialog]', { hasText: '처음대로' });
    await sheet.getByRole('radio', { name: fit }).click();
    await sheet.getByRole('button', { name: '완료', exact: true }).click();
    await expect(sheet).toHaveCount(0);
  }

  if (moveCrop) {
    // 포스터가 1장이면 순서 바꾸기 칸이 aria-disabled 라, 그 안의 칩은 강제로 누른다(실제로는 눌린다)
    await adjust.click({ force: true });
    const sheet = page.locator('[role=dialog]', { hasText: '처음대로' });
    // 줄이면(1/1.1) 이미지 비율과 상관없이 범위 값이 소수점 아래로 길어진다
    // 전체 보이기에서는 범위 상자가 숨어 있어, 꽉 채우기로 바꾼 뒤 움직인다
    await sheet.getByRole('radio', { name: '꽉 채우기' }).click();
    const cropBox = sheet.locator('[role=group][aria-label^="썸네일 조정"]');
    await expect(cropBox).toBeVisible();
    await cropBox.press('-');
    await cropBox.press('ArrowLeft');
    await sheet.getByRole('button', { name: '완료', exact: true }).click();
    await expect(sheet).toHaveCount(0);
  }

  await page.locator('#display-title').fill('E2E 테스트 전시');
  await page.getByRole('button', { name: '전시 유형' }).click();
  await page.getByRole('option', { name: '졸업 전시' }).click();
  await page.getByRole('button', { name: '회화', exact: true }).click();
  await page.locator('input[placeholder^="학과"]').fill('디자인학부');
  await page.getByRole('button', { name: '다음' }).click();

  // 2/2 기본 정보
  await expect(page).toHaveURL(/\/exhibition\/register\/basic$/);
  await page.getByRole('button', { name: '전시 기간 시작일' }).click();
  await page.getByRole('button', { name: /^11월 20일/ }).click();
  await page.getByRole('button', { name: /^11월 25일/ }).click();
  await page.getByRole('button', { name: '선택 완료' }).click();

  await page.getByRole('button', { name: '운영 시간 시작 시간' }).click();
  const timeLists = page.getByRole('dialog').getByRole('listbox');
  await timeLists.nth(0).getByRole('option', { name: '10:00', exact: true }).click();
  await timeLists.nth(1).getByRole('option', { name: '18:00', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '선택 완료' }).click();

  await page.locator('#display-place-name').fill('전시장');
  await page.getByRole('button', { name: '주소 주소 검색' }).click();
  await page.locator('input[type=search]').fill('테스트');
  await page.getByRole('button', { name: '검색', exact: true }).click();
  await page.getByRole('button', { name: /03062/ }).first().click();
  await page.getByRole('button', { name: '다음' }).click();

  // 작가명
  await expect(page).toHaveURL(/\/exhibition\/register\/artist$/);
  await page.locator('#display-artist-name').fill('홍길동');
}
