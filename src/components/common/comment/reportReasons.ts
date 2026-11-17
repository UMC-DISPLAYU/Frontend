export const REPORT_REASONS = [
  '스팸·광고',
  '욕설·비방',
  '음란·불쾌한 내용',
  '개인정보 노출',
  '기타',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/*
 * 댓글 신고 API가 아직 없어 신고하기 메뉴를 화면에 보이지 않는다.
 * API가 생기면 true로 바꾸고 사유를 서버로 보낸다
 */
export const COMMENT_REPORT_ENABLED = false;
