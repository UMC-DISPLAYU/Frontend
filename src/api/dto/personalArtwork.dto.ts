import type {
  ApiResponseDto,
  CursorPageInfoDto,
  ImageRequestDto,
  ImageResponseDto,
} from './common.dto';

export interface PersonalArtworkRequestDto {
  artworkName: string;
  content?: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size?: string;
  point?: string;
  images: ImageRequestDto[];
}

export interface PersonalArtworkResponseDataDto {
  personalArtworkId: number;
  userId: number;
  artworkName: string;
  content?: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size?: string;
  point?: string;
  createdAt: string;
  images: ImageResponseDto[];
}

export interface PersonalArtworkSummaryDto {
  personalArtworkId: number;
  artworkName: string;
  thumbnailUrl: string;
  type: string;
  createdAt: string;
}

export interface GetPersonalArtworksRequestDto {
  userId: number;
}

export type GetPersonalArtworksResponseDataDto = PersonalArtworkSummaryDto[];

export type GetPersonalArtworksResponseDto = ApiResponseDto<GetPersonalArtworksResponseDataDto>;

export type GetPersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type CreatePersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type UpdatePersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type DeletePersonalArtworkResponseDto = ApiResponseDto<null>;

export interface PersonalArtworkGuestbookUserDto {
  userId: number;
  nickname: string;
}

export interface PersonalArtworkFeelingReplyDto {
  personalFeelingReplyId: number;
  userId: number;
  nickname: string;
  content: string;
  createdAt: string;
  isCreator: boolean;
}

export interface PersonalArtworkFeelingDto {
  personalFeelingId: number;
  content: string;
  createdAt: string;
  user: PersonalArtworkGuestbookUserDto;
  replies: PersonalArtworkFeelingReplyDto[];
}

export interface GetPersonalArtworkFeelingsResponseDataDto extends CursorPageInfoDto {
  feelings: PersonalArtworkFeelingDto[];
}

export type GetPersonalArtworkFeelingsResponseDto =
  ApiResponseDto<GetPersonalArtworkFeelingsResponseDataDto>;

export interface CreatePersonalArtworkFeelingRequestDto {
  content: string;
}

export interface CreatePersonalArtworkFeelingResponseDataDto {
  personalFeelingId: number;
  userId: number;
  content: string;
  createdAt: string;
}

export type CreatePersonalArtworkFeelingResponseDto =
  ApiResponseDto<CreatePersonalArtworkFeelingResponseDataDto>;

export interface DeletePersonalArtworkFeelingResponseDataDto {
  personalFeelingId: number;
  deletedAt: string;
}

export type DeletePersonalArtworkFeelingResponseDto =
  ApiResponseDto<DeletePersonalArtworkFeelingResponseDataDto>;

export interface PersonalArtworkFeelingLikeResponseDataDto {
  personalFeelingId: number;
  liked: boolean;
  likeCount: number;
  createdAt: string;
  deletedAt: string | null;
}

export type PersonalArtworkFeelingLikeResponseDto =
  ApiResponseDto<PersonalArtworkFeelingLikeResponseDataDto>;

export interface CreatePersonalArtworkFeelingReplyRequestDto {
  content: string;
}

export interface CreatePersonalArtworkFeelingReplyResponseDataDto {
  personalFeelingReplyId: number;
  createdAt: string;
  content: string;
  personalFeelingId: number;
  userId: number;
  nickname: string;
  isCreator: boolean;
}

export type CreatePersonalArtworkFeelingReplyResponseDto =
  ApiResponseDto<CreatePersonalArtworkFeelingReplyResponseDataDto>;

export interface PersonalArtworkQuestionReplyDto {
  personalQuestionReplyId: number;
  userId: number;
  nickname: string;
  isCreator: boolean;
  content: string;
  createdAt: string;
}

export interface PersonalArtworkQuestionDto {
  personalQuestionId: number;
  content: string;
  isPublic: boolean;
  answerStatus: string;
  createdAt: string;
  user: PersonalArtworkGuestbookUserDto;
  reply: PersonalArtworkQuestionReplyDto | null;
}

export interface GetPersonalArtworkQuestionsResponseDataDto extends CursorPageInfoDto {
  questions: PersonalArtworkQuestionDto[];
}

export type GetPersonalArtworkQuestionsResponseDto =
  ApiResponseDto<GetPersonalArtworkQuestionsResponseDataDto>;

export interface CreatePersonalArtworkQuestionRequestDto {
  content: string;
  isPublic?: boolean;
}

export interface CreatePersonalArtworkQuestionResponseDataDto {
  personalQuestionId: number;
  content: string;
  isPublic: boolean;
  answerStatus: string;
  createdAt: string;
  userId: number;
}

export type CreatePersonalArtworkQuestionResponseDto =
  ApiResponseDto<CreatePersonalArtworkQuestionResponseDataDto>;

export interface DeletePersonalArtworkQuestionResponseDataDto {
  personalQuestionId: number;
  deletedAt: string;
}

export type DeletePersonalArtworkQuestionResponseDto =
  ApiResponseDto<DeletePersonalArtworkQuestionResponseDataDto>;

export interface CreatePersonalArtworkQuestionReplyRequestDto {
  content: string;
}

export interface CreatePersonalArtworkQuestionReplyResponseDataDto {
  personalQuestionReplyId: number;
  createdAt: string;
  content: string;
  personalQuestionId: number;
  userId: number;
  nickname: string;
  isCreator: boolean;
}

export type CreatePersonalArtworkQuestionReplyResponseDto =
  ApiResponseDto<CreatePersonalArtworkQuestionReplyResponseDataDto>;

export interface PersonalArtworkLikeResponseDataDto {
  personalArtworkId: number;
  isLiked: boolean;
  likeCount: number;
}

export type PersonalArtworkLikeResponseDto = ApiResponseDto<PersonalArtworkLikeResponseDataDto>;
