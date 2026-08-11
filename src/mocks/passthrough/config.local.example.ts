//해당 디렉토리에 config.local.ts 파일을 생성하여 아래와 같이 작성하면 됩니다

export const MSW_LOCAL_PASSTHROUGH_ENDPOINTS = [
  //(추천 세팅)
  'GET /api/v1/auth/google/login-url',
  'GET /api/v1/auth/kakao/login-url',
  'GET /api/auth/google/callback',
  'GET /api/auth/kakao/callback',
  'POST /api/v1/files/presigned-url',
];
