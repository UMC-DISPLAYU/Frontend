import type { ArtistProfileDto, UpdateArtistProfileRequestDto } from '@/api/dto';
import {
  ARTIST_FIELD_MAP,
  ARTIST_FIELD_REVERSE_MAP,
  type ArtistFieldCode,
  type ExhibitionField,
} from '@/constants/exhibition';
import { isInstagramUrl } from '@/utils/externalLink';
import { parseInstagramId, parseWebsiteUrl } from '@/utils/linkInput';

import type { EditArtistProfileFormValues } from './editArtistProfile.schema';

const instagramIdOf = (link?: string | null) => {
  const parsed = parseInstagramId(link ?? '');
  return parsed.status === 'valid' ? parsed.value : '';
};

/* instagramLink 칸이 생기기 전에는 링크 하나(externalLink)에 인스타그램 주소를 저장했다. 그 값은 Instagram 칸으로 옮긴다 */
export const toEditArtistProfileDefaults = (
  profile: ArtistProfileDto,
): EditArtistProfileFormValues => {
  const externalLink = profile.externalLink ?? '';
  const isLegacyInstagram = isInstagramUrl(externalLink);

  return {
    artistName: profile.artistName ?? '',
    fields: (profile.fields ?? [])
      .map((code) => ARTIST_FIELD_REVERSE_MAP[code as ArtistFieldCode])
      .filter((field): field is ExhibitionField => Boolean(field)),
    introduction: profile.introduction ?? '',
    instagram:
      instagramIdOf(profile.instagramLink) ||
      (isLegacyInstagram ? instagramIdOf(externalLink) : ''),
    portfolio: isLegacyInstagram ? '' : externalLink,
  };
};

const hrefOf = (parsed: ReturnType<typeof parseWebsiteUrl>) =>
  parsed.status === 'valid' ? parsed.href : null;

export const toUpdateArtistProfileBody = (
  values: EditArtistProfileFormValues,
  { profileImageUrl, schoolName }: { profileImageUrl: string | null; schoolName?: string },
): UpdateArtistProfileRequestDto => ({
  profileImageUrl,
  artistName: values.artistName.trim(),
  introduction: values.introduction.trim(),
  fields: values.fields.map((field) => ARTIST_FIELD_MAP[field]),
  externalLink: hrefOf(parseWebsiteUrl(values.portfolio)),
  instagramLink: hrefOf(parseInstagramId(values.instagram)),
  ...(schoolName ? { univName: schoolName } : {}),
});
