import { useState } from 'react';

import { useLocation } from 'react-router-dom';

import { LoungeBoardHeader, LoungeBoardPostCard } from '@/components/lounge-board';
import type { LoungeCategoryKey } from '@/constants/loungeCategories';
import { mockLoungePosts } from '@/mocks/lounge/lounge.mock';
import type { LoungeBoardPost } from '@/types/exhibition';

type TabKey = 'written' | 'comments' | 'scraps';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'written', label: '작성한 글' },
  { key: 'comments', label: '내 댓글' },
  { key: 'scraps', label: '스크랩' },
];

const toLoungeBoardPost = (post: (typeof mockLoungePosts)[number]): LoungeBoardPost => ({
  id: String(post.loungePostId),
  category: post.category as LoungeCategoryKey,
  title: post.title,
  description: post.content,
  author: post.writer.nickname,
  time: post.createdAt.slice(0, 10).replace(/-/g, '.'),
  commentCount: post.commentCount,
  images: post.postImageUrls,
});

const TAB_POSTS: Record<TabKey, LoungeBoardPost[]> = {
  written: mockLoungePosts.filter((post) => post.isMyPost).map(toLoungeBoardPost),
  comments: mockLoungePosts.slice(1, 5).map(toLoungeBoardPost),
  scraps: mockLoungePosts.filter((post) => post.isLiked).map(toLoungeBoardPost),
};

function isTabKey(value: unknown): value is TabKey {
  return value === 'written' || value === 'comments' || value === 'scraps';
}

function getTabFromState(state: unknown): TabKey {
  const tab = (state as { tab?: unknown } | null)?.tab;
  return isTabKey(tab) ? tab : 'written';
}

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

      <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-10">
        <div className="flex flex-col gap-3.5">
          {TAB_POSTS[activeTab].map((post) => (
            <LoungeBoardPostCard key={post.id} post={post} tagLabel={activeTabLabel} />
          ))}
        </div>
      </main>
    </div>
  );
}
