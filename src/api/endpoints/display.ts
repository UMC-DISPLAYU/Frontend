import type { GetGraduationDisplaysResponseDto, HomeExhibitionDto } from '@/api/dto';

export const getGraduationDisplays = async (): Promise<HomeExhibitionDto[]> => {
  const response = await fetch('/v1/display/graduation');

  if (!response.ok) {
    throw new Error(`Failed to fetch graduation displays: ${response.status}`);
  }

  const data = (await response.json()) as GetGraduationDisplaysResponseDto;

  if (data.resultType === 'FAIL') {
    throw new Error(data.error.message);
  }

  return data.success.data.exhibitions;
};
