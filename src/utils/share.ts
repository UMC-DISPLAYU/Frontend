async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // http 주소 · 권한 거부 등으로 clipboard API가 막힌 브라우저
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } catch {
      /* 복사할 방법이 없으면 조용히 끝낸다 */
    }
    textarea.remove();
  }
}

/*
 * 기기 기본 공유 창(Web Share API)을 띄운다. 지원하지 않는 브라우저는 링크만 조용히 복사한다(프로토타입 share.js).
 * 공유 창을 닫은 경우(AbortError)는 아무것도 하지 않는다.
 */
export async function shareLink({
  title,
  url = window.location.href,
}: {
  title: string;
  url?: string;
}) {
  const data: ShareData = { title, url };

  if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
    try {
      await navigator.share(data);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      await copyLink(url);
    }
    return;
  }

  await copyLink(url);
}
