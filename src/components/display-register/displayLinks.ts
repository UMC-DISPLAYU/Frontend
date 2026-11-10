export type LinkParseResult =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'valid'; value: string; href: string };

const INSTAGRAM_ID_PATTERN = /^[A-Za-z0-9._]{1,30}$/;
const HOSTNAME_PATTERN = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

/** 아이디, @아이디, instagram.com/아이디 주소를 모두 받아 아이디만 남긴다 */
export function parseInstagramId(raw: string): LinkParseResult {
  let value = raw.trim();
  if (!value) return { status: 'empty' };

  const fromUrl = value.match(/instagram\.com\/([^/?#\s]+)/i);
  if (fromUrl) value = fromUrl[1];
  value = value.replace(/^@+/, '').replace(/\/+$/, '');

  if (!INSTAGRAM_ID_PATTERN.test(value) || value.endsWith('.')) return { status: 'invalid' };
  return { status: 'valid', value, href: `https://instagram.com/${value}` };
}

/** 프로토콜 없이 적어도 https:// 를 붙여 확인한다. value 는 입력칸에 다시 보여줄 형태다 */
export function parseWebsiteUrl(raw: string): LinkParseResult {
  const trimmed = raw.trim();
  if (!trimmed) return { status: 'empty' };
  if (/\s/.test(trimmed)) return { status: 'invalid' };

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!HOSTNAME_PATTERN.test(url.hostname)) return { status: 'invalid' };

    const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
    return { status: 'valid', value: `${url.host}${path}${url.search}`, href: url.href };
  } catch {
    return { status: 'invalid' };
  }
}
