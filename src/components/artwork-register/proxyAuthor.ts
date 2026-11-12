import { MAX_PROXY_AUTHOR_NAME_LENGTH } from './artworkRegister.constants';

/** 대표자가 다른 작가의 작품을 대신 등록할 때 고른 작가 */
export type ProxyAuthor = { kind: 'member'; userId: number } | { kind: 'name'; name: string };

/** 작품 등록 경로. 대신 등록이면 고른 작가를 쿼리로 넘겨 새로고침해도 유지한다 */
export function buildArtworkRegisterPath(displayId: number, proxy?: ProxyAuthor) {
  const path = `/exhibition/${displayId}/artworks/new`;
  if (!proxy) return path;

  const query =
    proxy.kind === 'member'
      ? new URLSearchParams({ as: 'member', userId: String(proxy.userId) })
      : new URLSearchParams({ as: 'name', name: proxy.name });

  return `${path}?${query.toString()}`;
}

export function parseProxyAuthor(searchParams: URLSearchParams): ProxyAuthor | null {
  const kind = searchParams.get('as');

  if (kind === 'member') {
    const userId = Number(searchParams.get('userId'));
    return Number.isInteger(userId) && userId > 0 ? { kind: 'member', userId } : null;
  }

  if (kind === 'name') {
    const name = (searchParams.get('name') ?? '').trim().slice(0, MAX_PROXY_AUTHOR_NAME_LENGTH);
    return name ? { kind: 'name', name } : null;
  }

  return null;
}
