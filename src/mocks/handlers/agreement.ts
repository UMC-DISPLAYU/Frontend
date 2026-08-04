import { http } from 'msw';

import { paths, success } from '@/mocks/response';

export const agreementHandlers = paths('/api/v1/agreements').map((path) =>
  http.get(path, () =>
    success('/api/v1/agreements', [
      {
        agreementId: 1,
        id: 1,
        title: '서비스 이용약관',
        content: '서비스 이용약관 mock',
        required: true,
      },
      {
        agreementId: 2,
        id: 2,
        title: '개인정보 처리방침',
        content: '개인정보 처리방침 mock',
        required: true,
      },
      {
        agreementId: 3,
        id: 3,
        title: '마케팅 정보 수신 동의',
        content: '마케팅 정보 mock',
        required: false,
      },
    ]),
  ),
);
