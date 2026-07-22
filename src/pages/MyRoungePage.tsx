import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

import { useHeaderContext } from '@/components/layout/headerContext';

const TABS = ['작성한 글', '내 댓글', '저장한 글'];

interface Post {
  tag: string;
  title: string;
  body: string;
  author: string;
  time: string;
  comments: number;
}

const POSTS: Post[] = [
  {
    tag: '전시 후기',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    body: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    comments: 8,
  },
  {
    tag: '모집·협업',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    body: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    comments: 8,
  },
  {
    tag: '준비·작업 팁',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    body: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    comments: 8,
  },
  {
    tag: '소속전시',
    title: '이번 주 중앙대 회화 전시 다녀왔어요',
    body: '서울대학교 미술관에서 열린 전시를 다녀왔는데요, 전시 공간 구성도 좋고 작품들도 하나하나 인상 깊었...',
    author: 'artseeker_j',
    time: '1시간 전',
    comments: 8,
  },
];

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  return (
    <article className="w-full rounded-lg bg-card px-4 py-3.5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
      <div className="flex flex-col gap-3">
        <span className="w-fit rounded-sm bg-tag-gray px-2 py-0.5 typo-body-xxs-bold text-tag-blue">
          {post.tag}
        </span>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="typo-body-sm-bold text-main">{post.title}</h3>
            <p className="line-clamp-2 typo-body-sm-regular text-main">{post.body}</p>
          </div>

          <div className="flex items-center gap-2 typo-body-xs-regular text-faint">
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <span>{post.time}</span>
            <span aria-hidden>·</span>
            <span>댓글 {post.comments}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function MyRoungePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const { setHeader, resetHeader } = useHeaderContext();

  useEffect(() => {
    setHeader({ title: '' });
    return () => resetHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          className="-ml-1"
        >
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">내 라운지 활동</h1>
      </header>

      <div role="tablist" className="flex border-b border-line px-5">
        {TABS.map((tab, i) => {
          const active = i === activeTab;
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`flex h-11 flex-1 items-center justify-center border-b-2 ${
                active
                  ? 'border-main typo-body-sm-bold text-main'
                  : 'border-transparent typo-body-sm-regular text-faint'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <section className="flex-1 min-h-0 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-3.5">
          {POSTS.map((post, i) => (
            <PostCard key={i} post={post} />
          ))}
        </div>
      </section>
    </div>
  );
}
