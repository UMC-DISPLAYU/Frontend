// 유틸 사용 시 다음과 같이 사용할 수 있습니다
// ```
// const artworkPolicy = useArtworkPolicy(display, artwork);
// const questionPolicy = useQuestionPolicy(display, question);
//
// {hasPermission(artworkPolicy, 'delete') && <DeleteButton />}
// {hasPermission(questionPolicy, 'reply') && <ReplyForm />}
// ```

import type { PermissionMap } from '@/types/policy';

export function hasPermission<P extends PermissionMap>(policy: P, action: keyof P): boolean {
  return policy[action]();
}
