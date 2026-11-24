import { describe, expect, it } from 'vitest';

import { getInviteLinkStatus } from './inviteLinkStatus';

const LINK = 'https://displayu.co.kr/invitation/abc';

describe('getInviteLinkStatus', () => {
  it('링크를 받아 왔으면 활성화다', () => {
    expect(
      getInviteLinkStatus({ enabled: true, link: LINK, isLinkError: false, isToggling: false }),
    ).toBe('active');
  });

  it('다시 불러오기가 실패해도 받아 둔 링크가 있으면 활성화다', () => {
    expect(
      getInviteLinkStatus({ enabled: true, link: LINK, isLinkError: true, isToggling: false }),
    ).toBe('active');
  });

  it('켜져 있지만 링크 조회가 실패하면 실패다', () => {
    expect(
      getInviteLinkStatus({ enabled: true, link: '', isLinkError: true, isToggling: false }),
    ).toBe('error');
  });

  it('켜져 있고 링크를 아직 받지 못했으면 불러오는 중이다', () => {
    expect(
      getInviteLinkStatus({ enabled: true, link: '', isLinkError: false, isToggling: false }),
    ).toBe('loading');
  });

  it('켜는 요청 중에는 이전 조회 실패가 남아 있어도 불러오는 중이다', () => {
    expect(
      getInviteLinkStatus({ enabled: true, link: '', isLinkError: true, isToggling: true }),
    ).toBe('loading');
  });

  it('꺼져 있으면 링크 · 오류와 상관없이 꺼짐이다', () => {
    expect(
      getInviteLinkStatus({ enabled: false, link: LINK, isLinkError: true, isToggling: false }),
    ).toBe('off');
    expect(
      getInviteLinkStatus({ enabled: false, link: '', isLinkError: false, isToggling: true }),
    ).toBe('off');
  });
});
