import { Link } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import contentStack from '@/assets/display-detail/content-stack.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import { getContentOpenNotice } from './displayDetail.utils';

type Props = {
  display: DisplayDetailDto;
  /* 위에 소개 글이 있을 때만 구분선을 긋는다 */
  divided?: boolean;
  /* 콘텐츠 카드가 갈 주소. 없으면 공개 전시 콘텐츠 */
  contentPath?: (categoryId: number) => string;
  /* 등록 중 전시(팀원 미리보기)는 공개 시점 안내를 띄우지 않는다 */
  isPreview?: boolean;
};

/* 섹션 사이 연한 구분선. 900px 이상은 본문 폭 끝까지 */
const DIVIDER =
  'relative before:absolute before:inset-x-gutter before:top-0 before:h-px before:bg-tertiary desktop:before:inset-x-0';

function IntroText({ content }: { content: string }) {
  return (
    <section aria-label="전시소개" className="px-gutter pt-5 desktop:px-0">
      <p className="typography-body-lg-regular text-pretty whitespace-pre-line text-secondary">
        {content}
      </p>
    </section>
  );
}

/* 피그마 메모: 인스타그램 게시물 첫 표지(3:4)를 자르지 않고 144×192로, 아래에 콘텐츠 제목 한 줄 */
function ContentCards({ display, contentPath, divided }: Props) {
  return (
    <section
      aria-label="전시콘텐츠"
      className={cn('px-gutter pt-5 desktop:px-0', divided && [DIVIDER, 'mt-7 pt-5.25'])}
    >
      <div className="-mx-gutter flex snap-x snap-proximity scroll-px-gutter gap-3 overflow-x-auto px-gutter [scrollbar-width:none] desktop:mx-0 desktop:grid desktop:grid-cols-3 desktop:overflow-visible desktop:px-0 [&::-webkit-scrollbar]:hidden">
        {display.contentCategories.map((category) => (
          <Link
            key={category.categoryId}
            to={
              contentPath?.(category.categoryId) ??
              `/display/${display.displayId}/contents?category=${category.categoryId}`
            }
            className="group w-36 shrink-0 snap-start text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus desktop:w-auto"
          >
            <div className="relative">
              <OptimizedImage
                src={category.contents[0]?.imageUrl}
                displayWidth={288}
                alt=""
                skeleton
                frameClassName="aspect-3/4 w-full overflow-hidden border border-primary bg-tertiary"
                className="size-full object-cover transition-transform duration-slow ease-standard group-hover:scale-104"
              />
              {/* 프로토타입은 사진이 1장이면 묶음 표시를 빼지만, 1장이어도 보인다(PM/FE 2차 회의 2026-11-16) */}
              <span
                aria-hidden="true"
                className="absolute top-1.75 right-1.75 grid size-5 place-items-center"
              >
                <img src={contentStack} alt="" />
              </span>
            </div>
            <strong className="typography-body-lg-semibold mt-2 block truncate">
              {category.name}
            </strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function IntroPanel({ display, contentPath, isPreview = false }: Props) {
  const hasContents = display.contentCategories.length > 0;
  const openNotice =
    !hasContents && !isPreview
      ? getContentOpenNotice(display.exhibitionContentOpen, display.period)
      : null;

  const intro = display.content?.trim();
  const hasIntro = Boolean(intro);

  return (
    <div className="pb-10">
      {intro && <IntroText content={intro} />}
      {hasContents && (
        <ContentCards display={display} contentPath={contentPath} divided={hasIntro} />
      )}
      {openNotice && (
        <section
          aria-label="전시콘텐츠"
          className={cn('px-gutter desktop:px-0', hasIntro && [DIVIDER, 'mt-7'])}
        >
          <p className="typography-body-lg-regular pt-14 pb-6 text-center text-tertiary">
            {openNotice}
          </p>
        </section>
      )}
    </div>
  );
}
