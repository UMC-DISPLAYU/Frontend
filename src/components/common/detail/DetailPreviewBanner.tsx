/* 공개 전 미리보기 띠. 붙는 위치(--detail-top)가 40px 기준이라 좁은 화면에서도 한 줄로 두고 넘치면 말줄임 */
export function DetailPreviewBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="typography-body-md-medium sticky top-0 z-40 flex h-10 items-center justify-center gap-2 bg-primary-black px-gutter text-center text-interactive-inverse"
    >
      <b className="typography-body-md-semibold shrink-0 rounded-circle bg-primary-white px-2 py-0.5 text-primary">
        미리보기
      </b>
      <span className="min-w-0 truncate">{message}</span>
    </div>
  );
}
