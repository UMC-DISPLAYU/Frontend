import { useEffect, useRef, useState } from 'react';

import { useLocation } from 'react-router-dom';

import type { LoungePostSummaryDto } from '@/api/dto';
import { ErrorView, LoadingView } from '@/components/common';
import { LoungeBoardHeader, LoungeBoardPostCard } from '@/components/lounge-board';
import { toLoungeCategoryKey } from '@/constants/loungeCategories';
import {
  useMyLoungeComments,
  useMyLoungePosts,
  useMyLoungeScraps,
} from '@/hooks/queries/useLoungeMyActivity';
import type { LoungeBoardPost } from '@/types/exhibition';
import { formatRelativeTime } from '@/utils/date';

type TabKey = 'written' | 'comments' | 'scraps';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'written', label: '작성한 글' },
  { key: 'comments', label: '내 댓글' },
  { key: 'scraps', label: '스크랩' },
];

function isTabKey(value: unknown): value is TabKey {
  return value === 'written' || value === 'comments' || value === 'scraps';
}

function getTabFromState(state: unknown): TabKey {
  const tab = (state as { tab?: unknown } | null)?.tab;
  return isTabKey(tab) ? tab : 'written';
}

const toBoardPost = (post: LoungePostSummaryDto): LoungeBoardPost | undefined => {
  const categoryKey = toLoungeCategoryKey(post.category);
  if (!categoryKey) return undefined;

  return {
    id: String(post.loungePostId),
    category: categoryKey,
    title: post.title,
    description: post.content,
    author: post.writer.nickname,
    time: formatRelativeTime(post.createdAt),
    commentCount: post.commentCount,
    images: post.postImageUrls.length > 0 ? post.postImageUrls : undefined,
  };
};

export function MyActivityPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>(() => getTabFromState(location.state));

  // 같은 경로로 다시 navigate하면 컴포넌트가 리마운트되지 않으므로,
  // location.key(내비게이션마다 고유)가 바뀌면 렌더링 중 탭을 다시 동기화한다.
  const [syncedKey, setSyncedKey] = useState(location.key);
  if (location.key !== syncedKey) {
    setSyncedKey(location.key);
    setActiveTab(getTabFromState(location.state));
  }

  const activeTabLabel = TABS.find((tab) => tab.key === activeTab)?.label;

  const postsQuery = useMyLoungePosts({ enabled: activeTab === 'written' });
  const commentsQuery = useMyLoungeComments({ enabled: activeTab === 'comments' });
  const scrapsQuery = useMyLoungeScraps({ enabled: activeTab === 'scraps' });

  const activeQuery =
    activeTab === 'written' ? postsQuery : activeTab === 'comments' ? commentsQuery : scrapsQuery;
  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = activeQuery;

  const posts =
    data?.pages.flatMap((page) => page.posts).flatMap((post) => toBoardPost(post) ?? []) ?? [];

  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full max-w-105 mx-auto h-dvh bg-page flex flex-col">
      <LoungeBoardHeader title="내 활동" showWriteButton={false} className="px-5" />

      <nav className="mt-[15.5px] px-5 border-b border-zinc-300 flex items-center">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 h-11 flex items-center justify-center border-b-2 ${
                isActive ? 'border-main' : 'border-transparent'
              }`}
            >
              <span
                className={
                  isActive ? 'typo-body-sm-bold text-main' : 'typo-body-sm-regular text-faint'
                }
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      <main className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 pt-5 pb-10 flex flex-col">
        {isPending ? (
          <LoadingView fullScreen={false} />
        ) : isError ? (
          <ErrorView fullScreen={false} message="불러오지 못했어요. 잠시 후 다시 시도해주세요." />
        ) : posts.length === 0 && !hasNextPage ? (
          <ErrorView fullScreen={false} message={`${activeTabLabel} 항목이 없어요.`} />
        ) : (
          <div className="flex flex-col gap-3.5">
            {posts.map((post) => (
              <LoungeBoardPostCard key={post.id} post={post} />
            ))}

            <div ref={triggerRef} className="h-4" />
            {isFetchingNextPage && <LoadingView fullScreen={false} message="불러오는 중..." />}
          </div>
        )}
      </main>
    </div>
  );
}
