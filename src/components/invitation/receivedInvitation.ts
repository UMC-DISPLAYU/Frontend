import type { MyDisplayInvitationDto } from '@/api/dto';
import { formatExhibitionPeriod } from '@/utils/formatExhibitionPeriod';

export type ReceivedInvitation = {
  invitationId: number;
  displayId: number;
  /** 초대 카드 맨 위 줄. 예: 초대 · 고상준(sangjun24) */
  inviterLabel: string;
  title: string;
  organization: string;
  /** 예: 2026.11.12 - 11.18 */
  period: string;
  placeName: string;
  posterUrl: string | null;
};

export function toReceivedInvitation(dto: MyDisplayInvitationDto): ReceivedInvitation {
  const leaderName = dto.leaderName?.trim() ?? '';
  const nickname = dto.userNickname?.trim() ?? '';

  return {
    invitationId: dto.invitationId,
    displayId: dto.displayId,
    inviterLabel: `초대 · ${leaderName}${nickname ? `(${nickname})` : ''}`,
    title: dto.title,
    organization: dto.schoolDepartmentName ?? '',
    period: dto.startDate ? formatExhibitionPeriod(dto.startDate, dto.endDate) : '',
    placeName: dto.placeName ?? '',
    posterUrl: dto.thumbnailUrl || null,
  };
}

/** 참여 완료 화면의 기간. 프로토타입처럼 카드 표기의 ' - ' 를 ' – ' 로 바꾼다 */
export const toCompletePeriod = (period: string) => period.replace(' - ', ' – ');

/** 참여 완료의 "내 작품 등록하기". 팀원은 전시 작업의 작품 추가처럼 작품 정보 입력부터 시작한다 */
export const getArtworkRegisterPath = (displayId: number) =>
  `/exhibition/${displayId}/artworks/add/basic`;
