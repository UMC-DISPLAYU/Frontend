export type ExternalLink = { label: string; href: string };

/* 아이디만 남긴다. @나 인스타그램 주소를 그대로 넣은 값도 받는다 */
export function toInstagramLink(value?: string | null): ExternalLink | null {
  const id = (value ?? '')
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];
  if (!id) return null;
  return { label: `@${id}`, href: `https://www.instagram.com/${encodeURIComponent(id)}/` };
}

/* 사용자가 입력한 주소라 http(s)만 연다. 보이는 글자는 https · www 를 뺀 주소 */
export function toWebsiteLink(value?: string | null): ExternalLink | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const label = `${url.host.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`;
  return { label, href: url.href };
}

export const isInstagramUrl = (value?: string | null) =>
  /^(https?:\/\/)?(www\.)?instagram\.com\//i.test((value ?? '').trim());
