export const REPORT_REASONS = [
  '스팸·광고',
  '욕설·비방',
  '음란·불쾌한 내용',
  '개인정보 노출',
  '기타',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/*
 * 남의 댓글 더보기(⋯) 메뉴의 신고하기를 보인다(사용자 결정: API 전이라도 UI는 띄운다).
 * 댓글 신고 API가 아직 없어 사유를 고르면 접수 토스트만 띄우고 서버로는 보내지 않는다. API가 생기면 거기서 보낸다
 */
export const COMMENT_REPORT_ENABLED = true;
