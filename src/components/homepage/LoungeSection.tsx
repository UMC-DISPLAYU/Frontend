import type { LoungePostSummaryDto } from '@/api/dto';
import { SectionHeader } from '@/components/homepage/SectionHeader';
import { LoungePostCard } from '@/components/ui';

type Props = {
  posts: LoungePostSummaryDto[];
};

export function LoungeSection({ posts }: Props) {
  return (
    <section className="mb-2">
      <SectionHeader title="라운지" linkTo="/lounge" />
      <div>
        {posts.map((post) => (
          <LoungePostCard key={post.loungePostId} post={post} className="mx-4 mb-3" />
        ))}
      </div>
    </section>
  );
}
