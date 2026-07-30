import type { GetArtworkDetailResponseDataDto } from '@/api/dto/displayArtwork.dto';
import type { ArtworkDetail, ArtworkImage } from '@/types/exhibition';

/**
 * GET /api/v1/artworks/:artworkId 응답을 UI ArtworkDetail 타입으로 변환합니다.
 *
 * @todo 백엔드에서 exhibitionInfo.exhibitionThumbnailUrl, exhibitionInfo.exhibitionOrganizer
 *       필드가 추가되면 아래 TODO 주석 위치의 fallback 코드를 교체하세요.
 */
export function mapArtworkDetailDto(dto: GetArtworkDetailResponseDataDto): ArtworkDetail {
  const thumbnailImage = dto.images.find((img) => img.isThumbnail);
  const firstImage = dto.images[0];

  const images: ArtworkImage[] = dto.images.map((img) => ({
    imageUrl: img.imageUrl,
    isThumbnail: img.isThumbnail,
    sortOrder: img.sortOrder,
  }));

  return {
    artworkId: dto.artworkId,
    artworkName: dto.artworkName,
    content: dto.content,
    type: dto.type,
    productionYear: dto.productionYear,
    materialMedia: dto.materialMedia,
    size: dto.size,
    point: dto.point,
    images,
    artistName: dto.artistName,
    artistUserId: dto.artistUserId,
    exhibitionId: dto.exhibitionInfo.displayId,
    exhibitionTitle: dto.exhibitionInfo.exhibitionTitle,
    exhibitionPeriod: dto.exhibitionInfo.exhibitionPeriod,
    // @todo 백엔드 exhibitionOrganizer 필드 추가 시: dto.exhibitionInfo.exhibitionOrganizer
    exhibitionOrganizer:
      dto.exhibitionInfo.exhibitionOrganizer ?? dto.exhibitionInfo.exhibitionLocation,
    // @todo 백엔드 exhibitionThumbnailUrl 필드 추가 시: dto.exhibitionInfo.exhibitionThumbnailUrl
    exhibitionThumbnail:
      dto.exhibitionInfo.exhibitionThumbnailUrl ??
      thumbnailImage?.imageUrl ??
      firstImage?.imageUrl ??
      '',
    likeCount: dto.likeCount,
    isLiked: dto.isLiked,
    isSaved: dto.isSaved,
  };
}
