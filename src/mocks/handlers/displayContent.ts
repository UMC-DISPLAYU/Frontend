/* eslint-disable @typescript-eslint/no-explicit-any */
import { http } from 'msw';

import { mockDb } from '@/mocks/data/repository';
import { created, noContent, paths, readJson, success, toNumber } from '@/mocks/response';

const findDisplay = (displayId: number) =>
  mockDb.displays.find((display: any) => display.displayId === displayId) ?? mockDb.displays[0];

export const displayContentHandlers = [
  ...paths('/api/v1/display/{displayId}/content-categories').map((path) =>
    http.post(path, async ({ params, request }) => {
      const display = findDisplay(toNumber(params.displayId, 101));
      const body = await readJson<{ name?: string; description?: string | null }>(request);
      const category = {
        categoryId: Date.now(),
        name: body.name ?? '새 콘텐츠',
        description: body.description ?? null,
        sortOrder: display.contentCategories.length + 1,
        contents: [],
      };
      display.contentCategories.push(category);

      return created('/api/v1/display/{displayId}/content-categories', category);
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
