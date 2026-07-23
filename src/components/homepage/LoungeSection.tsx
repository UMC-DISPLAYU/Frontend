import type { LoungePostSummaryDto } from '@/api/dto';
import { SectionHeader } from '@/components/homepage/SectionHeader';
import { LoungePostCard } from '@/components/ui';

type Props = {
  posts: LoungePostSummaryDto[];
};

export function LoungeSection({ posts }: Props) {
  return (
    <section>
      <SectionHeader title="라운지" linkTo="/lounge" />
      <div>
        {posts.map((post) => (
          <LoungePostCard
            key={post.loungePostId}
            category={post.category}
            title={post.title}
            writerName={post.writer.nickname}
            createdAt={post.createdAt}
            commentCount={post.commentCount}
            className="mx-4 mb-4"
          />
        ))}
      </div>
    </section>
  );
}
