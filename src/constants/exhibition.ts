export const EXHIBITION_TYPES = [
  { label: '졸업 전시', group: 'institution' },
  { label: '과제 전시', group: 'institution' },
  { label: '학과·학회 전시', group: 'institution' },
  { label: '연합 전시', group: 'institution' },
  { label: '소모임·동아리 전시', group: 'organization' },
  { label: '기타 단체 전시', group: 'organization' },
] as const;

export const EXHIBITION_FIELDS = [
  '회화',
  '디자인',
  '사진',
  '건축',
  '영상',
  '조소',
  '패션',
  '일러스트',
  '공예',
  '기타',
] as const;

export type ExhibitionTypeGroup = 'institution' | 'organization';
export type ExhibitionType = (typeof EXHIBITION_TYPES)[number]['label'];
export type ExhibitionField = (typeof EXHIBITION_FIELDS)[number];

export const MAX_POSTER_UPLOAD_IMAGES = 4;
export const MAX_ARTWORK_UPLOAD_IMAGES = 20;
export const MAX_ARTWORK_PROGRESS_IMAGES = 20;
