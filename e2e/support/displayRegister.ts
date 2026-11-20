import { fileURLToPath } from 'node:url';

import { expect, type Page } from '@playwright/test';

const POSTER = fileURLToPath(new URL('../fixtures/poster.png', import.meta.url));

/** 달력은 오늘 이전 날짜를 막으므로, 이 날짜로 시계를 고정한 뒤 같은 달 안에서 고른다 */
export const REGISTER_TODAY = new Date('2026-11-10T10:00:00+09:00');

/** 등록 1/2 · 2/2 · 작가명을 채우고 '전시 준비하기'를 누르기 직전까지 간다 */
export async function fillDisplayRegisterFlow(page: Page) {
  await expect(page).toHaveURL(/\/exhibition\/register$/);

  // 1/2 소개
  await page.locator('input[type=file]').first().setInputFiles(POSTER);
  // 대표 포스터 조정 칩은 업로드가 끝난 뒤에 붙는다
  await expect(page.getByLabel('대표 포스터 썸네일 조정')).toBeAttached();

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
