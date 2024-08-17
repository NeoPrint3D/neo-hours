export function getMessageStatusType(statusCode: number) {
  return statusCode >= 200 && statusCode < 300
    ? "success"
    : statusCode >= 400 && statusCode < 500
      ? "error" // for now just errors
      : statusCode >= 500 && statusCode < 600
        ? "error"
        : "neutral";
}
