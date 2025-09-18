export type ApiSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

export type ApiError = {
  ok: false;
  status: number;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiError;
