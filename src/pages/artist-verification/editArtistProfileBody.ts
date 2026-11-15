import type { ArtistProfileDto, UpdateArtistProfileRequestDto } from '@/api/dto';
import { ARTIST_PROFILE_FIELDS, type ArtistProfileField } from '@/constants/artistField';
import { isInstagramUrl } from '@/utils/externalLink';
import { parseInstagramId, parseWebsiteUrl } from '@/utils/linkInput';

import type { EditArtistProfileFormValues } from './editArtistProfile.schema';

/*
 * 서버는 예전 이름도 받아 새 이름으로 저장하지만, 조회는 DB 값을 그대로 준다.
 * 그래서 CRAFT · CRAFTS 처럼 같은 분야가 두 이름으로 올 수 있어 새 이름으로 맞춰 비교한다
 */
const FIELD_ALIASES: Record<string, string> = {
  UXUI: 'UX_UI',
  MEDIA: 'VIDEO',
  CRAFT: 'CRAFTS',
  ETC: 'OTHERS',
};
const canonicalField = (code: string) => FIELD_ALIASES[code] ?? code;

const toFormField = (code: string): ArtistProfileField | undefined =>
  ARTIST_PROFILE_FIELDS.find((field) => canonicalField(field) === canonicalField(code));

/* 아이디로 읽히지 않는 값은 그대로 보여 준다. 빈칸으로 두면 다음 저장 때 말없이 지워진다 */
const instagramIdOf = (link?: string | null) => {
  const parsed = parseInstagramId(link ?? '');
  return parsed.status === 'valid' ? parsed.value : (link ?? '');
};

/* instagramLink 칸이 생기기 전에는 링크 하나(externalLink)에 인스타그램 주소를 저장했다. 그 값은 Instagram 칸으로 옮긴다 */
export const toEditArtistProfileDefaults = (
  profile: ArtistProfileDto,
): EditArtistProfileFormValues => {
  const externalLink = profile.externalLink ?? '';
  const isLegacyInstagram = isInstagramUrl(externalLink);

  return {
    artistName: profile.artistName ?? '',
    fields: [
      ...new Set(
        (profile.fields ?? [])
          .map(toFormField)
          .filter((field): field is ArtistProfileField => Boolean(field)),
      ),
    ],
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
  fields: values.fields.map(canonicalField),
  externalLink: hrefOf(parseWebsiteUrl(values.portfolio)),
  instagramLink: hrefOf(parseInstagramId(values.instagram)),
  ...(schoolName ? { univName: schoolName } : {}),
});
