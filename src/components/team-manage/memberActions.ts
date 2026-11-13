import type { TeamRole } from './teamMembers';

export type MemberAction = 'admin' | 'unadmin' | 'owner' | 'kick';

interface MemberActionCopy {
  menuLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
}

export const MEMBER_ACTION_COPY: Record<MemberAction, MemberActionCopy> = {
  admin: {
    menuLabel: '관리자 지정',
    title: '관리자로 지정할까요?',
    description:
      '전시 콘텐츠와 전체 작품을 관리할 수 있어요\n전시 등록, 팀원 관리, 공개 설정은 대표자만 관리해요',
    confirmLabel: '관리자 지정',
  },
  unadmin: {
    menuLabel: '관리자 해제',
    title: '관리자 권한을 해제할까요?',
    description: '팀원으로 변경되며, 본인의 작품만 관리할 수 있어요',
    confirmLabel: '권한 해제',
  },
  owner: {
    menuLabel: '대표자 위임',
    title: '대표자를 위임할까요?',
    description:
      '전시 관리 권한이 즉시 이전되고 관리자로 변경돼요\n이후 대표자 변경은 새 대표자만 할 수 있어요',
    confirmLabel: '대표자 위임',
  },
  kick: {
    menuLabel: '팀원 내보내기',
    title: '전시에서 내보낼까요?',
    description: '이 전시의 작업 공간에 접근할 수 없게 돼요',
    confirmLabel: '내보내기',
  },
};

/** ⋯ 메뉴 항목. 관리자면 해제, 그 외(팀원)는 지정을 맨 위에 둔다 */
export const getMemberActions = (role: TeamRole): MemberAction[] => [
  role === 'manager' ? 'unadmin' : 'admin',
  'owner',
  'kick',
];

/** 대표자 위임은 완료 화면으로 넘어가므로 토스트가 없다 */
export const getMemberActionToast = (action: MemberAction, name: string): string | null => {
  if (action === 'admin') return `${name}님을 관리자로 지정했어요`;
  if (action === 'unadmin') return `${name}님이 팀원으로 변경됐어요`;
  if (action === 'kick') return `${name}님을 전시에서 내보냈어요`;
  return null;
};
