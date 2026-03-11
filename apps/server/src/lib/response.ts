export function successResponse<T>(message: string, data: T) {
  return {
    message,
    data
  };
}

export function errorResponse(message: string) {
  return {
    message
  };
}
