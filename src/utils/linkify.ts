export type LinkifySegment =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
// 문장 끝 마침표 · 닫는 괄호처럼 주소 뒤에 바로 붙어 쓰는 글자는 주소에서 뺀다
const TRAILING_PUNCTUATION = /[.,!?;:)\]}>'"」』〉》…~]+$/;

/* 글 속 http(s):// · www. 주소를 링크 조각으로 나눈다. 링크는 http · https 주소만 만든다 */
export function linkifyText(text: string): LinkifySegment[] {
  const segments: LinkifySegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const url = match[0].replace(TRAILING_PUNCTUATION, '');
    if (!url || /^(?:https?:\/\/|www\.)$/i.test(url)) continue;

    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    try {
      new URL(href);
    } catch {
      continue;
    }

    if (start > cursor) segments.push({ type: 'text', text: text.slice(cursor, start) });
    segments.push({ type: 'link', text: url, href });
    cursor = start + url.length;
  }

  if (cursor < text.length) segments.push({ type: 'text', text: text.slice(cursor) });
  return segments;
}
