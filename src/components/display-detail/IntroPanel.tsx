import { Link } from 'react-router-dom';

import type { DisplayDetailDto } from '@/api/dto';
import contentStack from '@/assets/display-detail/content-stack.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

type Props = {
  display: DisplayDetailDto;
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
function ContentCards({ display }: Props) {
  return (
    <section aria-label="전시콘텐츠" className={cn(DIVIDER, 'mt-7 px-gutter pt-5.25 desktop:px-0')}>
      <div className="-mx-gutter flex snap-x snap-proximity scroll-px-gutter gap-3 overflow-x-auto px-gutter [scrollbar-width:none] desktop:mx-0 desktop:grid desktop:grid-cols-3 desktop:overflow-visible desktop:px-0 [&::-webkit-scrollbar]:hidden">
        {display.contentCategories.map((category) => (
          <Link
            key={category.categoryId}
            to={`/display/${display.displayId}/contents?category=${category.categoryId}`}
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
              {/* 인스타그램처럼 사진이 여러 장이면 오른쪽 위에 묶음 표시 */}
              {category.contents.length > 1 && (
                <span
                  aria-hidden="true"
                  className="absolute top-1.75 right-1.75 grid size-5 place-items-center"
                >
                  <img src={contentStack} alt="" />
                </span>
              )}
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

export function IntroPanel({ display }: Props) {
  return (
    <div className="pb-10">
      {display.content && <IntroText content={display.content} />}
      {display.contentCategories.length > 0 && <ContentCards display={display} />}
    </div>
  );
}
