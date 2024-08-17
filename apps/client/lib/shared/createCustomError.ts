type CustomErrorData =
  | { redirectTo: string; redirectText: string; details: string }
  | { redirectTo?: never; redirectText?: never; details: string };

export interface CustomError {
  statusCode: number;
  statusMessage: string;
  message: string;
  data: CustomErrorData;
}

export function createCustomError(error: CustomError) {
  const { statusCode, statusMessage, message, data } = error;
  return createError({
    statusCode,
    statusMessage,
    message,
    data,
  });
}
