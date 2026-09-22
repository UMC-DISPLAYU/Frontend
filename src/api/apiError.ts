export class ApiError extends Error {
  code?: string;
  details?: unknown;
  transportCode?: string;
  status?: number;

  constructor(
    message: string,
    options: { code?: string; details?: unknown; status?: number; transportCode?: string } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = options.code;
    this.details = options.details;
    this.status = options.status;
    this.transportCode = options.transportCode;
  }
}
