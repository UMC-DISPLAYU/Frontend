import { renderToString } from 'react-dom/server';

import { error as consoleError } from 'node:console';

import { createMemoryRouter, Outlet, type RouteObject, RouterProvider } from 'react-router-dom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { router as browserRouter } from '@/Router';

import { Layout } from './Layout';

// 브라우저 전용 생성자만 대체하고, 실제 라우트·handle·Layout을 함께 검증합니다.
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    createBrowserRouter: (routes: RouteObject[]) =>
      actual.createMemoryRouter(routes, { initialEntries: ['/login'] }),
  };
});

vi.mock('@/components/common', () => ({ LoadingView: () => null }));
vi.mock('@/hooks/queries/useUserProfile', () => ({ useUserMe: () => ({ data: undefined }) }));
vi.mock('@/hooks/usePendingRedirect', () => ({ useRedirectAfterLogin: () => {} }));

// 페이지 데이터 요청/권한 검사 없이 동일한 라우트 트리로 Layout을 렌더링합니다.
function layoutRoutes(routes: RouteObject[]): RouteObject[] {
  return routes.map((route) => {
    const result = {
      ...route,
      element: route.path === '/' ? <Layout /> : <Outlet />,
      errorElement: <div>Not Found</div>,
    };
    if (result.children) result.children = layoutRoutes(result.children);
    return result;
  });
}

const routes = layoutRoutes(browserRouter.routes);

function expectChrome(
  router: ReturnType<typeof createMemoryRouter>,
  navbar: boolean,
  footer: boolean,
) {
  const html = renderToString(<RouterProvider router={router} />);
  expect(html.includes('href="/home"')).toBe(navbar);
  expect(html.includes('<footer')).toBe(footer);
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation((message, ...args) => {
    // DOM 없이 렌더링할 때 React Router가 출력하는 알려진 SSR 경고만 제외합니다.
    if (typeof message === 'string' && message.startsWith('Warning: useLayoutEffect')) return;
    consoleError(message, ...args);
  });
});

afterAll(() => {
  browserRouter.dispose();
  vi.restoreAllMocks();
});

describe('Layout route handles', () => {
  it.each([
    ['/home', true, true],
    ['/home?view=artwork-preview', true, true],
    ['/home/', true, true],
    ['/HOME', false, false],
    ['/search?q=art', true, false],
    ['/search/', true, false],
    ['/lounge', true, false],
    ['/lounge/review', true, false],
    ['/lounge/my-activity', true, false],
    ['/lounge/my-questions', false, false],
    ['/lounge/my-questions-archive', false, false],
    ['/lounge/my-questions/1', false, false],
    ['/lounge/review/1', false, false],
    ['/lounge/review/1/edit', false, false],
    ['/lounge/review/post', false, false],
    ['/lounge/review/post/', true, false],
    ['/my', true, false],
    ['/my/', false, false],
    ['/my/exhibitions', false, false],
    ['/my-questions', false, false],
    ['/exhibition/register', false, false],
    ['/exhibition/1/manage', false, false],
    ['/exhibition/1/work', false, false],
    ['/exhibition/1/contents', false, false],
    ['/exhibition/1/contents/2', false, false],
    ['/exhibition/1/artworks/add/basic', false, false],
    ['/personal-artworks/register', false, false],
    ['/display/1', false, false],
    ['/home/missing', false, false],
    ['/search/missing', false, false],
    ['/lounge/review/1/missing', false, false],
    ['/login', false, false],
  ])('직접 진입 %s: navbar=%s, footer=%s', async (path, navbar, footer) => {
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    try {
      await vi.waitFor(() => expect(router.state.initialized).toBe(true));
      expectChrome(router, navbar, footer);
    } finally {
      router.dispose();
    }
  });

  it('중첩 페이지 이동 후 뒤로 가면 이전 페이지 표시 규칙을 복원한다', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/home'] });
    try {
      expectChrome(router, true, true);
      await router.navigate('/my/exhibitions');
      expectChrome(router, false, false);
      await router.navigate(-1);
      expectChrome(router, true, true);
      await router.navigate('/lounge/review');
      expectChrome(router, true, false);
      await router.navigate('/lounge/review/post');
      expectChrome(router, false, false);
      await router.navigate(-1);
      expectChrome(router, true, false);
    } finally {
      router.dispose();
    }
  });
});
