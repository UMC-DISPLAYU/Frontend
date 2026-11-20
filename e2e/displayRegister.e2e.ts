import { expect, type Page, test } from '@playwright/test';

import { fillDisplayRegisterFlow, REGISTER_TODAY } from './support/displayRegister';
import { loginAsMockUser } from './support/session';

const COMPLETED_URL = /\/exhibition\/\d+\/created$/;

const entries = [
  { from: '/my', button: '새 전시 등록', backTo: /\/my$/, heading: '마이' },
  { from: '/home', button: '전시 등록하기', backTo: /\/home$/, heading: undefined },
  {
    from: '/display-management',
    button: '전시 등록',
    backTo: /\/display-management$/,
    heading: '내 전시 관리',
  },
];

/*
 * #637 재현: 기록 이동(history.go)이 늦게 처리되는 사이에 react-router 의 navigate(-n) 대기가 먼저 풀리는 상황.
 * react-router 는 이 대기를 다른 이동이 끝날 때도 함께 풀어 주므로, 지금 주소로의 popstate 를 먼저 보내 그 경우를 만든다.
 * 시트 닫기도 기록 이동을 쓰므로 제출 직전에만 건다
 */
const makeHistoryGoLate = (page: Page, ms: number) =>
  page.evaluate((delay) => {
    const go = History.prototype.go;
    History.prototype.go = function (this: History, delta?: number) {
      window.dispatchEvent(new PopStateEvent('popstate', { state: this.state }));
      setTimeout(() => go.call(this, delta), delay);
    };
  }, ms);

const submitAndExpectCompleted = async (page: Page) => {
  await page.getByRole('button', { name: '전시 준비하기' }).click();

  await expect(page).toHaveURL(COMPLETED_URL);
  await expect(page.getByRole('heading', { name: '전시 관리가 생성되었어요' })).toBeVisible();
  // 완료 주소로 바뀐 뒤 늦게 처리된 되돌아가기가 화면을 등록 전으로 되돌리지 않는지 조금 더 지켜본다
  await page.waitForTimeout(1000);
  await expect(page).toHaveURL(COMPLETED_URL);
  await expect(page.getByRole('heading', { name: '전시 관리가 생성되었어요' })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(REGISTER_TODAY);
  await loginAsMockUser(page);
});

for (const entry of entries) {
  test(`${entry.from} 에서 등록하면 완료 화면이 뜨고, 뒤로가기는 등록 전 화면으로 간다`, async ({
    page,
  }) => {
    await page.goto(entry.from);
    await page
      .getByRole('button', { name: entry.button, exact: true })
      .or(page.getByRole('link', { name: entry.button, exact: true }))
      .first()
      .click();
    await fillDisplayRegisterFlow(page);

    await submitAndExpectCompleted(page);

    await page.goBack();
    await expect(page).toHaveURL(entry.backTo);
    if (entry.heading) {
      await expect(page.getByRole('heading', { name: entry.heading, level: 1 })).toBeVisible();
    }
  });
}

test('기록 이동이 늦게 처리돼도 완료 화면이 남는다(#637)', async ({ page }) => {
  await page.goto('/my');
  await page
    .getByRole('button', { name: '새 전시 등록', exact: true })
    .or(page.getByRole('link', { name: '새 전시 등록', exact: true }))
    .first()
    .click();
  await fillDisplayRegisterFlow(page);
  await makeHistoryGoLate(page, 300);

  await submitAndExpectCompleted(page);
});
