/*
 * 받은 초대는 마이 화면 위의 시트라 주소가 따로 없다.
 * 초대 링크 · 기존 경로(/invitation-request)로 들어오면 마이로 보내면서 "도착하면 시트를 열어 달라"는 요청을 여기 남긴다.
 * history state 로 넘기면 시트가 쌓는 오버레이 기록에 함께 복사돼, 나중에 그 기록으로 돌아올 때 시트가 다시 열린다.
 */
let isRequested = false;

export function requestReceivedInvitations() {
  isRequested = true;
}

export function hasReceivedInvitationsRequest() {
  return isRequested;
}

export function clearReceivedInvitationsRequest() {
  isRequested = false;
}
