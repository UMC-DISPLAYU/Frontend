import { useState } from 'react';

import { Bookmark, ChevronRight, ChevronUp } from 'lucide-react';

import defaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
import type { ArtworkDetail } from '@/types/exhibition';

type Props = {
  artwork: ArtworkDetail;
};

export function ArtworkIntroTab({ artwork }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [bookmarkedArtists, setBookmarkedArtists] = useState<Record<string, boolean>>({});

  const artistList = artwork.artist
    ? artwork.artist
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean)
    : [];

  const toggleArtistBookmark = (artistName: string) => {
    setBookmarkedArtists((prev) => ({
      ...prev,
      [artistName]: !prev[artistName],
    }));
  };

  return (
    <div className="pb-6">
      {/* 작품소개 */}
      <section className="px-5 pt-7 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="typo-body-xl-bold text-main">작품소개</h2>
        </div>
        <p
          className={`typo-body-sm-regular text-main leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}
        >
          {artwork.content}
        </p>
        <div className="flex items-center justify-end pt-3">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-0.5 typo-body-xs-regular text-faint cursor-pointer"
          >
            <span>{isExpanded ? '접기' : '더보기'}</span>
            {isExpanded ? (
              <ChevronUp size={14} strokeWidth={1.5} />
            ) : (
              <ChevronRight size={14} strokeWidth={1.5} />
            )}
          </button>
        </div>
      </section>

      {/* 작업과정 */}
      <section className="px-5 pt-5 pb-5 bg-box200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="typo-body-xl-bold text-main">작업과정</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {artwork.images
            .filter((img) => !img.isThumbnail)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((img, idx) => (
              <img
                key={idx}
                src={img.imageUrl}
                alt={`작업과정 ${idx + 1}`}
                className="w-full h-40 object-cover rounded-2xl"
              />
            ))}
        </div>
      </section>

      {/* 감상 포인트 */}
      <section className="px-5 pt-5 pb-5">
        <h2 className="typo-body-xl-bold text-main mb-3">감상 포인트</h2>
        <p className="typo-body-sm-regular text-main leading-relaxed">{artwork.point}</p>
      </section>

      {/* 작가 정보 */}
      <section className="pt-2 pb-4 flex flex-col">
        {artistList.map((artistName) => {
          const isBookmarked = bookmarkedArtists[artistName] ?? false;
          return (
            <div
              key={artistName}
              className="w-full h-20 px-5 py-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={defaultProfileIcon}
                  alt={artistName}
                  className="size-10 rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col justify-center items-start gap-0.5 min-w-0 flex-1">
                  <p className="w-full typo-body-md-bold text-main truncate">{artistName}</p>
                  <p className="w-full typo-body-xs-regular text-faint truncate">작가닉네임</p>
                </div>
              </div>

              <button
                type="button"
                aria-label={`${artistName} 작가 북마크`}
                onClick={() => toggleArtistBookmark(artistName)}
                className="w-5 h-11 flex justify-center items-center shrink-0 cursor-pointer"
              >
                <Bookmark
                  className={`size-5 transition-colors ${
                    isBookmarked ? 'fill-line text-line' : ' text-faint'
                  }`}
                  strokeWidth={1}
                />
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
