import { describe, expect, it } from 'vitest';

import type { MyDisplayInvitationDto } from '@/api/dto';

import {
  getArtworkRegisterPath,
  toCompletePeriod,
  toReceivedInvitation,
} from './receivedInvitation';

const dto = (overrides: Partial<MyDisplayInvitationDto> = {}): MyDisplayInvitationDto => ({
  invitationId: 1,
  displayId: 12,
  thumbnailUrl: 'https://cdn.example.com/poster.png',
  startDate: '2026-05-28',
  endDate: '2026-06-05',
  location: 'SEOUL',
  leaderName: '고상준',
  userNickname: 'sangjun24',
  schoolDepartmentName: '중앙대학교 디자인학부',
  title: 'FORM 2026',
  placeName: '301호 2층 아트홀',
  ...overrides,
});

describe('toReceivedInvitation', () => {
  it('Figma 초대 카드와 같은 글자로 바꾼다', () => {
    expect(toReceivedInvitation(dto())).toEqual({
      invitationId: 1,
      displayId: 12,
      inviterLabel: '초대 · 고상준(sangjun24)',
      title: 'FORM 2026',
      organization: '중앙대학교 디자인학부',
      period: '2026.05.28 - 06.05',
      placeName: '301호 2층 아트홀',
      posterUrl: 'https://cdn.example.com/poster.png',
    });
  });

  it('닉네임이 없거나 공백이면 괄호를 붙이지 않는다', () => {
    expect(toReceivedInvitation(dto({ userNickname: undefined })).inviterLabel).toBe(
      '초대 · 고상준',
    );
    expect(toReceivedInvitation(dto({ userNickname: '  ' })).inviterLabel).toBe('초대 · 고상준');
  });

  it('하루 전시 · 해를 넘기는 전시 기간을 카드 표기대로 쓴다', () => {
    expect(toReceivedInvitation(dto({ endDate: '2026-05-28' })).period).toBe('2026.05.28');
    expect(
      toReceivedInvitation(dto({ startDate: '2026-12-28', endDate: '2027-01-05' })).period,
    ).toBe('2026.12.28 - 2027.01.05');
  });

  it('빈 값은 빈 글자 · null 로 둔다', () => {
    const invitation = toReceivedInvitation(
      dto({ thumbnailUrl: '', schoolDepartmentName: undefined, startDate: '' }),
    );

    expect(invitation.posterUrl).toBeNull();
    expect(invitation.organization).toBe('');
    expect(invitation.period).toBe('');
  });
});

describe('toCompletePeriod', () => {
  it('참여 완료 화면은 기간 사이를 – 로 쓴다', () => {
    expect(toCompletePeriod('2026.05.28 - 06.05')).toBe('2026.05.28 – 06.05');
    expect(toCompletePeriod('2026.05.28')).toBe('2026.05.28');
  });
});

it('내 작품 등록하기는 그 전시의 작품 등록 화면으로 바로 간다', () => {
  expect(getArtworkRegisterPath(12)).toBe('/exhibition/12/artworks/new');
});
