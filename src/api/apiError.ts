export class ApiError extends Error {
  code?: string;
  details?: string | null;
  status?: number;

  constructor(
    message: string,
    options: { code?: string; details?: string | null; status?: number } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
  }
}

/* 요청 도중 로그인 세션이 바뀌어 응답을 버린 경우입니다. 재시도하지 않습니다. */
export class SessionChangedError extends Error {
  constructor() {
    super('Authentication session changed');
    this.name = 'SessionChangedError';
  }
}
