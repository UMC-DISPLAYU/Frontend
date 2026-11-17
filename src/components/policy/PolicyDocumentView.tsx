import { Fragment } from 'react';

import { cn } from '@/utils/cn';

import type { PolicyBlock, PolicyTableRow } from './policyDocuments';

/** `**굵게**` 구간만 굵은 글씨로 바꾼다 */
function RichText({ text }: { text: string }) {
  return text.split('**').map((part, index) =>
    index % 2 === 1 ? (
      <b key={index} className="font-semibold text-primary">
        {part}
      </b>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}

/* 프로토타입은 앞 블록 종류에 따라 위 간격이 달라진다(.eff + .ch 24, .art + p 4 …). 같은 규칙을 그대로 옮긴다 */
const marginTop = (block: PolicyBlock, prev: PolicyBlock | undefined) => {
  const prevType = prev?.type;
  switch (block.type) {
    case 'effective':
      return '';
    case 'heading':
      return prevType === 'effective' ? 'mt-6' : 'mt-8';
    case 'article':
      return prevType === 'heading' ? 'mt-4' : 'mt-5';
    case 'paragraph':
    case 'list':
      if (prevType === 'article') return 'mt-1';
      if (prevType === 'heading') return 'mt-3';
      if (prevType === 'effective' && block.type === 'paragraph') return 'mt-6';
      return 'mt-2';
    case 'table':
      return prevType === 'heading' ? 'mt-3' : 'mt-4';
  }
};

function TableRows({ rows }: { rows: PolicyTableRow[] }) {
  return (
    <dl>
      {rows.map((row, index) => {
        const prev = rows[index - 1];
        return (
          <div
            key={row.label}
            className={cn(
              'grid gap-x-2',
              row.stack ? 'grid-cols-1' : 'grid-cols-[64px_1fr]',
              prev && (row.stack && prev.stack ? 'mt-3' : 'mt-1.5'),
            )}
          >
            <dt className={cn('text-tertiary', row.stack && 'typography-body-md-medium')}>
              {row.label}
            </dt>
            <dd className={cn('wrap-anywhere text-primary', row.strong && 'font-semibold')}>
              <RichText text={row.value} />
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function Block({ block }: { block: PolicyBlock }) {
  switch (block.type) {
    case 'effective':
      return <p className="typography-body-md-medium text-tertiary">{block.text}</p>;
    case 'heading':
      return <h3 className="typography-body-xl-semibold text-primary">{block.text}</h3>;
    case 'article':
      return <h4 className="font-semibold text-primary">{block.text}</h4>;
    case 'paragraph':
      return (
        <p>
          {block.lines.map((line) => (
            <span key={line} className="block">
              <RichText text={line} />
            </span>
          ))}
        </p>
      );
    case 'list':
      return (
        <ul>
          {block.items.map((item) => (
            <li
              key={item.text}
              className={cn(
                'relative',
                item.sub
                  ? 'pl-6'
                  : 'pl-3 before:absolute before:top-[0.7em] before:left-0.5 before:h-px before:w-1 before:bg-current',
              )}
            >
              <RichText text={item.text} />
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        <div>
          {block.groups.map((group, index) => (
            <section key={group.title ?? index} className={cn(index > 0 && 'mt-6')}>
              {group.title ? (
                <h4 className="mb-2 font-semibold text-primary">{group.title}</h4>
              ) : null}
              <TableRows rows={group.rows} />
            </section>
          ))}
        </div>
      );
  }
}

export function PolicyDocumentView({ blocks }: { blocks: PolicyBlock[] }) {
  return (
    <article className="typography-body-lg-regular mt-2 pb-16 text-secondary">
      {blocks.map((block, index) => (
        <div key={index} className={marginTop(block, blocks[index - 1])}>
          <Block block={block} />
        </div>
      ))}
    </article>
  );
}
