export const useShare = () => {
  const handleShare = async (url: string, title: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert('링크가 복사되었습니다');
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Share failed:', err);
    }
  };

  return { handleShare };
};
