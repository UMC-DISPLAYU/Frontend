import { useEffect, useRef, useState } from 'react';

import { useLocation } from 'react-router-dom';

import type { LoungePostSummaryDto } from '@/api/dto';
import { ErrorView, LoadingView } from '@/components/common';
import { LoungeBoardHeader, LoungeBoardPostCard } from '@/components/lounge-board';
import { toLoungeCategoryKey } from '@/constants/loungeCategories';
import { useMyLoungePosts, useMyLoungeScraps } from '@/hooks/queries/useLoungeMyActivity';
import { MY_COMMENTED_POSTS } from '@/mocks/exhibition';
import type { LoungeBoardPost } from '@/types/exhibition';
import { formatLoungeTime } from '@/utils/date';

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
    time: formatLoungeTime(post.createdAt),
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

  // "내 댓글"은 백엔드 응답이 게시글 원문 형태로 바뀐 뒤 연동 예정 (지금은 mock)
  const postsQuery = useMyLoungePosts({ enabled: activeTab === 'written' });
  const scrapsQuery = useMyLoungeScraps({ enabled: activeTab === 'scraps' });

  const posts =
    postsQuery.data?.pages.flatMap((page) => page.posts).flatMap((p) => toBoardPost(p) ?? []) ?? [];
  const scraps =
    scrapsQuery.data?.pages.flatMap((page) => page.posts).flatMap((p) => toBoardPost(p) ?? []) ??
    [];

  const isCommentsTab = activeTab === 'comments';
  const activeQuery = activeTab === 'written' ? postsQuery : scrapsQuery;
  const { isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = activeQuery;
  const itemCount =
    activeTab === 'written'
      ? posts.length
      : isCommentsTab
        ? MY_COMMENTED_POSTS.length
        : scraps.length;

  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el || isCommentsTab) return;

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
  }, [isCommentsTab, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
        {isCommentsTab ? (
          MY_COMMENTED_POSTS.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {MY_COMMENTED_POSTS.map((post) => (
                <LoungeBoardPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <ErrorView fullScreen={false} message={`${activeTabLabel} 항목이 없어요.`} />
          )
        ) : isPending ? (
          <LoadingView fullScreen={false} />
        ) : isError ? (
          <ErrorView fullScreen={false} message="불러오지 못했어요. 잠시 후 다시 시도해주세요." />
        ) : itemCount > 0 ? (
          <div className="flex flex-col gap-3.5">
            {activeTab === 'written' &&
              posts.map((post) => <LoungeBoardPostCard key={post.id} post={post} />)}
            {activeTab === 'scraps' &&
              scraps.map((post) => <LoungeBoardPostCard key={post.id} post={post} />)}

            <div ref={triggerRef} className="h-4" />
            {isFetchingNextPage && <LoadingView fullScreen={false} message="불러오는 중..." />}
          </div>
        ) : (
          <ErrorView fullScreen={false} message={`${activeTabLabel} 항목이 없어요.`} />
        )}
      </main>
    </div>
  );
}
