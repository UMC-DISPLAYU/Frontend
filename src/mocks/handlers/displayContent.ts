/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { created, fail, noContent, paths, readJson, success, toNumber } from '@/mocks/response';

const findDisplay = (displayId: number) =>
  mockDb.displays.find((display: any) => display.displayId === displayId) ?? mockDb.displays[0];

// 섹션과 사진을 한 번에 만들 때 id 가 겹치지 않게 하나씩 올린다
let nextMockId = Date.now();
const mockId = () => (nextMockId += 1);

const CATEGORIES_PATH = '/api/v1/display/{displayId}/content-categories';
const REORDER_CATEGORIES_PATH = '/api/v1/display/{displayId}/content-categories/reorder';

export const displayContentHandlers = [
  ...paths(CATEGORIES_PATH).map((path) =>
    http.post(path, async ({ params, request }) => {
      const display = findDisplay(toNumber(params.displayId, 101));
      const body = await readJson<{ name?: string; imageUrls?: string[] | null }>(request);
      // 실서버: 생략 · null 은 빈 섹션, 빈 배열 · 20장 초과는 거절
      if (body.imageUrls && (body.imageUrls.length === 0 || body.imageUrls.length > 20)) {
        return fail(CATEGORIES_PATH, 400, 'COMMON400', '입력값이 올바르지 않습니다.');
      }
      const name = body.name ?? '새 콘텐츠';
      const category = {
        categoryId: mockId(),
        displayId: display.displayId,
        name,
        title: name,
        description: null,
        sortOrder: display.contentCategories.length + 1,
        contents: (body.imageUrls ?? []).map((imageUrl, index) => {
          const contentId = mockId();
          return {
            contentId,
            imageId: contentId,
            imageUrl,
            width: 1600,
            height: 1600,
            sortOrder: index + 1,
            userId: mockDb.me.userId,
          };
        }),
      };
      display.contentCategories.push(category);

      return created(CATEGORIES_PATH, category);
    }),
  ),
  // {categoryId} 핸들러보다 먼저 둬야 reorder 가 카테고리 id 로 잡히지 않는다
  ...paths(REORDER_CATEGORIES_PATH).map((path) =>
    http.patch(path, async ({ params, request }) => {
      const display = findDisplay(toNumber(params.displayId, 101));
      const { orderedCategoryIds = [] } = await readJson<{ orderedCategoryIds?: number[] }>(
        request,
      );
      const byId = new Map<number, any>(
        display.contentCategories.map((category: any) => [category.categoryId, category]),
      );
      // 실서버: 전시의 모든 섹션 id 를 중복 없이 보내야 한다(누락 · 중복 · 다른 전시 id 는 400)
      const isValid =
        orderedCategoryIds.length === byId.size &&
        new Set(orderedCategoryIds).size === orderedCategoryIds.length &&
        orderedCategoryIds.every((categoryId) => byId.has(categoryId));
      if (!isValid) {
        return fail(
          REORDER_CATEGORIES_PATH,
          400,
          'INVALID_DISPLAY_CONTENT_CATEGORY_ORDER',
          '섹션 순서가 올바르지 않습니다.',
        );
      }
      display.contentCategories = orderedCategoryIds.map((categoryId, index) => ({
        ...byId.get(categoryId),
        sortOrder: index + 1,
      }));

      return success(REORDER_CATEGORIES_PATH, {
        displayId: display.displayId,
        categories: display.contentCategories,
      });
    }),
  ),
  ...paths('/api/v1/display/{displayId}/content-categories/{categoryId}').map((path) =>
    http.patch(path, async ({ params, request }) => {
      const display = findDisplay(toNumber(params.displayId, 101));
      const category = display.contentCategories.find(
        (item: any) => item.categoryId === toNumber(params.categoryId),
      );
      Object.assign(category ?? {}, await readJson(request));

      return success(
        '/api/v1/display/{displayId}/content-categories/{categoryId}',
        category ?? null,
      );
    }),
  ),
  ...paths('/api/v1/display/{displayId}/content-categories/{categoryId}').map((path) =>
    http.delete(path, ({ params }) => {
      const display = findDisplay(toNumber(params.displayId, 101));
      display.contentCategories = display.contentCategories.filter(
        (item: any) => item.categoryId !== toNumber(params.categoryId),
      );

      return noContent('/api/v1/display/{displayId}/content-categories/{categoryId}');
    }),
  ),
  ...paths('/api/v1/display/{displayId}/content-categories/{categoryId}/contents').map((path) =>
    http.post(path, async ({ params, request }) => {
      const display = findDisplay(toNumber(params.displayId, 101));
      const category = display.contentCategories.find(
        (item: any) => item.categoryId === toNumber(params.categoryId),
      );
      const body = await readJson<{ imageUrl?: string; width?: number; height?: number }>(request);
      const content = {
        contentId: Date.now(),
        imageUrl: body.imageUrl ?? display.images[0]?.imageUrl,
        width: body.width ?? 1600,
        height: body.height ?? 1600,
        sortOrder: (category?.contents.length ?? 0) + 1,
        userId: mockDb.me.userId,
      };
      category?.contents.push(content);

      return created(
        '/api/v1/display/{displayId}/content-categories/{categoryId}/contents',
        content,
      );
    }),
  ),
  ...paths('/api/v1/display/{displayId}/content-categories/{categoryId}/contents/reorder').map(
    (path) =>
      http.patch(path, async ({ params, request }) => {
        const display = findDisplay(toNumber(params.displayId, 101));
        const category = display.contentCategories.find(
          (item: any) => item.categoryId === toNumber(params.categoryId),
        );
        const body = await readJson<{ orderedContentIds?: number[] }>(request);
        const orderedIds = body.orderedContentIds ?? [];

        // 요청 순서대로 정렬하고 sortOrder를 다시 매깁니다.
        if (category && orderedIds.length > 0) {
          const byId = new Map<number, any>(
            category.contents.map((content: any) => [content.contentId, content]),
          );
          const reordered = orderedIds
            .map((contentId) => byId.get(contentId))
            .filter((content): content is any => Boolean(content));
          const rest = category.contents.filter(
            (content: any) => !orderedIds.includes(content.contentId),
          );

          category.contents = [...reordered, ...rest].map((content: any, index: number) => ({
            ...content,
            sortOrder: index + 1,
          }));
        }

        return noContent(
          '/api/v1/display/{displayId}/content-categories/{categoryId}/contents/reorder',
        );
      }),
  ),
  ...paths('/api/v1/display/{displayId}/content-categories/{categoryId}/contents/{contentId}').map(
    (path) =>
      http.patch(path, async ({ request }) =>
        success(
          '/api/v1/display/{displayId}/content-categories/{categoryId}/contents/{contentId}',
          await readJson(request),
        ),
      ),
  ),
  ...paths('/api/v1/display/{displayId}/content-categories/{categoryId}/contents/{contentId}').map(
    (path) =>
      http.delete(path, ({ params }) => {
        const display = findDisplay(toNumber(params.displayId, 101));
        const category = display.contentCategories.find(
          (item: any) => item.categoryId === toNumber(params.categoryId),
        );

        if (category) {
          category.contents = category.contents.filter(
            (content: any) => content.contentId !== toNumber(params.contentId),
          );
        }

        return noContent(
          '/api/v1/display/{displayId}/content-categories/{categoryId}/contents/{contentId}',
        );
      }),
  ),
];
