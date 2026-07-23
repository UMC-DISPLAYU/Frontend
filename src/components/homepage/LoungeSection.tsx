import { SectionHeader } from '@/components/homepage/SectionHeader';
import type { LoungePost } from '@/types/exhibition';

function LoungePostItem({ post }: { post: LoungePost }) {
  return (
    <div className="mx-4 mb-4 px-4 py-3.5 bg-card rounded-lg shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col gap-2.5">
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="px-2 py-0.5 bg-bt-gray rounded-sm inline-flex items-center self-start">
            <span className="text-link text-[10px] font-bold">{post.tag}</span>
          </div>

          <div className="flex flex-col gap-1">
            <p className="typo-body-sm-bold text-main">{post.content}</p>
            <div className="flex items-center gap-2 typo-body-xs-regular text-faint">
              <span>{post.author}</span>
              <span>·</span>
              <span>{post.time}</span>
              <span>·</span>
              <span>{post.views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Props = {
  posts: LoungePost[];
};

export function LoungeSection({ posts }: Props) {
  return (
    <section>
      <SectionHeader title="라운지" />
      <div>
        {posts.map((post) => (
          <LoungePostItem key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
