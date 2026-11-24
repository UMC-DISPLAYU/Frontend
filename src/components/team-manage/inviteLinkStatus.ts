export type InviteLinkStatus = 'active' | 'loading' | 'error' | 'off';

interface InviteLinkStatusInput {
  enabled: boolean;
  link: string;
  isLinkError: boolean;
  isToggling: boolean;
}

/* 토글이 켜져 있어도 링크를 받아 와 복사할 수 있을 때만 활성화로 본다 */
export const getInviteLinkStatus = ({
  enabled,
  link,
  isLinkError,
  isToggling,
}: InviteLinkStatusInput): InviteLinkStatus => {
  if (!enabled) return 'off';
  if (link !== '') return 'active';
  // 켜는 요청 중에는 이전 조회 실패가 남아 있어도 새 링크를 기다린다
  if (isLinkError && !isToggling) return 'error';
  return 'loading';
};
