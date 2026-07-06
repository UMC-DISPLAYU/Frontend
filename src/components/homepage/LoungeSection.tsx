import { SectionHeader } from '@/components/homepage/SectionHeader';
import type { LoungePost } from '@/types/home';

function LoungePostItem({ post }: { post: LoungePost }) {
  return (
    <div className="mx-4 mb-4 rounded-lg shadow-sm border border-zinc-300 bg-white p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-bold
       text-sky-600 bg-gray-200"
        >
          {post.tag}
        </span>

        <button
          type="button"
          className="text-[#BBBBBB] hover:text-[#999999] bg-transparent border-none cursor-pointer p-0 text-lg font-bold leading-none"
        >
          ···
        </button>
      </div>

      <p className="text-[14px] font-bold text-[#111111] leading-snug">{post.content}</p>

      <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
        <span>{post.author}</span>
        <span className="text-[#D1D5DB]">·</span>
        <span>{post.time}</span>
        <span className="text-[#D1D5DB]">·</span>
        <span>{post.views}</span>
      </div>
    </div>
  );
}

type Props = {
  posts: LoungePost[];
};

export function LoungeSection({ posts }: Props) {
  return (
    <section className="mb-8">
      <SectionHeader title="라운지" />
      <div>
        {posts.map((post) => (
          <LoungePostItem key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
