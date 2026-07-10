import type { GetGraduationDisplaysResponseDto, HomeExhibitionDto } from '@/api/dto';

export const getGraduationDisplays = async (): Promise<HomeExhibitionDto[]> => {
  const response = await fetch('/v1/display/graduation');
  const data = (await response.json()) as GetGraduationDisplaysResponseDto;

  if (data.resultType === 'FAIL') {
    throw new Error(data.error.message);
  }

  return data.success.data.exhibitions;
};
