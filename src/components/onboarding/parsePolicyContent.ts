export type PolicyLabeledItem = { label: string; value: string };

export type PolicyBlock =
  | { type: 'intro'; text: string }
  | { type: 'summary'; items: PolicyLabeledItem[] }
  | { type: 'caption'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'definition'; label: string; value: string }
  | { type: 'footer'; items: PolicyLabeledItem[] };

type Line = { text: string; afterBlank: boolean };

const HEADING = /^(제\d+조|\d+\.)\s/;
const BULLET = /^[-•]\s+/;
/* "https://" 처럼 콜론 뒤에 공백이 없는 경우는 라벨로 보지 않는다 */
const LABELED = /^([^:]{1,15}):\s+(.+)$/;
const SENTENCE_END = /[.!?。]$/;

const toLabeled = (text: string): PolicyLabeledItem | null => {
  const match = LABELED.exec(text);
  return match ? { label: match[1].trim(), value: match[2].trim() } : null;
};

const toLines = (content: string): Line[] => {
  const lines: Line[] = [];
  let afterBlank = false;

  for (const raw of content.split('\n')) {
    const text = raw.trim();
    if (!text) {
      afterBlank = lines.length > 0;
      continue;
    }
    lines.push({ text, afterBlank });
    afterBlank = false;
  }

  return lines;
};

/** 첫 조항 제목 앞의 안내 영역: "라벨: 값" 줄은 요약 카드, 문장이 아닌 줄은 캡션, 나머지는 안내 문단 */
const parseIntro = (lines: Line[]): PolicyBlock[] => {
  const blocks: PolicyBlock[] = [];

  for (const { text } of lines) {
    const labeled = toLabeled(text);
    const last = blocks.at(-1);

    if (labeled) {
      if (last?.type === 'summary') last.items.push(labeled);
      else blocks.push({ type: 'summary', items: [labeled] });
    } else if (SENTENCE_END.test(text)) {
      blocks.push({ type: 'intro', text });
    } else {
      blocks.push({ type: 'caption', text });
    }
  }

  return blocks;
};

const parseSection = (lines: Line[], isLast: boolean): PolicyBlock[] => {
  /* 마지막 조항 뒤에 빈 줄로 떨어진 "라벨: 값" 묶음은 조항 내용이 아니라 문서 하단 정보다 */
  let footerStart = lines.length;
  if (isLast) {
    let start = lines.length;
    while (start > 0 && toLabeled(lines[start - 1].text)) start -= 1;
    if (start > 0 && start < lines.length && lines[start].afterBlank) footerStart = start;
  }

  const body = lines.slice(0, footerStart);
  const hasBullet = body.some(({ text }) => BULLET.test(text));
  const plainCount = body.filter(({ text }) => !BULLET.test(text) && !toLabeled(text)).length;
  /* 서버 약관은 글머리 기호(-) 없이 항목을 줄마다 나열하기도 한다. 그런 조항은 줄마다 글머리로 보여준다 */
  const plainAsBullet = !hasBullet && plainCount > 1;

  const blocks: PolicyBlock[] = body.map(({ text }, index): PolicyBlock => {
    if (BULLET.test(text)) return { type: 'bullet', text: text.replace(BULLET, '') };

    const labeled = toLabeled(text);
    if (labeled) return { type: 'definition', ...labeled };

    const next = body[index + 1]?.text;
    if (next && BULLET.test(next) && !SENTENCE_END.test(text)) return { type: 'subheading', text };

    return plainAsBullet ? { type: 'bullet', text } : { type: 'paragraph', text };
  });

  const footerItems = lines
    .slice(footerStart)
    .map(({ text }) => toLabeled(text))
    .filter((item): item is PolicyLabeledItem => item !== null);
  if (footerItems.length) blocks.push({ type: 'footer', items: footerItems });

  return blocks;
};

/** 서버가 내려주는 약관 원문(줄 단위 텍스트)을 피그마 약관 상세 화면의 블록으로 나눈다. */
export const parsePolicyContent = (content: string): PolicyBlock[] => {
  const lines = toLines(content);
  const firstHeading = lines.findIndex(({ text }) => HEADING.test(text));
  if (firstHeading === -1) return parseSection(lines, true);

  const blocks = parseIntro(lines.slice(0, firstHeading));
  const headingIndexes = lines.flatMap(({ text }, index) => (HEADING.test(text) ? [index] : []));

  headingIndexes.forEach((start, order) => {
    const end = headingIndexes[order + 1] ?? lines.length;
    blocks.push({ type: 'heading', text: lines[start].text });
    blocks.push(...parseSection(lines.slice(start + 1, end), order === headingIndexes.length - 1));
  });

  return blocks;
};

/** 서버 시행일 "2026-08-01"을 피그마 표기 "2026. 08. 01"로 바꾼다. 다른 형식은 그대로 둔다. */
export const formatEffectiveDate = (value: string) =>
  value.replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$1. $2. $3');
