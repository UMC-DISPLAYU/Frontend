import { describe, expect, it } from 'vitest';

import { getMemberActions, getMemberActionToast, MEMBER_ACTION_COPY } from './memberActions';

describe('getMemberActions', () => {
  it('관리자는 맨 위가 관리자 해제다', () => {
    expect(getMemberActions('manager')).toEqual(['unadmin', 'owner', 'kick']);
  });

  it('팀원은 맨 위가 관리자 지정이다', () => {
    expect(getMemberActions('member')).toEqual(['admin', 'owner', 'kick']);
  });

  it('메뉴 문구는 프로토타입 순서와 같다', () => {
    expect(
      getMemberActions('member').map((action) => MEMBER_ACTION_COPY[action].menuLabel),
    ).toEqual(['관리자 지정', '대표자 위임', '팀원 내보내기']);
  });
});

describe('getMemberActionToast', () => {
  it.each([
    ['admin', '한여름님을 관리자로 지정했어요'],
    ['unadmin', '한여름님이 팀원으로 변경됐어요'],
    ['kick', '한여름님을 전시에서 내보냈어요'],
  ] as const)('%s 완료 토스트', (action, message) => {
    expect(getMemberActionToast(action, '한여름')).toBe(message);
  });

  it('대표자 위임은 완료 화면으로 넘어가 토스트가 없다', () => {
    expect(getMemberActionToast('owner', '한여름')).toBeNull();
  });
});
