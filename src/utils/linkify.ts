export type LinkifySegment =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

const URL_PATTERN = /(?:https?:\/\/|www\.)[^\s<>"'`]+/gi;
// 문장 끝 마침표 · 닫는 괄호처럼 주소 뒤에 바로 붙어 쓰는 글자는 주소에서 뺀다
const TRAILING_PUNCTUATION = /[.,!?;:)\]}>'"」』〉》…~]$/;
const BRACKET_PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

const count = (text: string, char: string) => text.split(char).length - 1;

/* 끝 문장 부호를 하나씩 뗀다. 닫는 괄호는 주소 안에 여는 괄호가 모자랄 때만 뗀다(예: wiki/Art_(visual)) */
function trimTrailingPunctuation(url: string) {
  let result = url;
  while (TRAILING_PUNCTUATION.test(result)) {
    const last = result[result.length - 1];
    const open = BRACKET_PAIRS[last];
    if (open && count(result, open) >= count(result, last)) break;
    result = result.slice(0, -1);
  }
  return result;
}

/* 글 속 http(s):// · www. 주소를 링크 조각으로 나눈다. 링크는 http · https 주소만 만든다 */
export function linkifyText(text: string): LinkifySegment[] {
  const segments: LinkifySegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index ?? 0;
    const url = trimTrailingPunctuation(match[0]);
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
