import type { IncomingMessage } from "http";

export function getIp(req: IncomingMessage) {
  const ipHeader = req.headers["x-forwarded-for"] as string;
  return ipHeader ? ipHeader.split(/, /)[0] : req.socket.remoteAddress;
}
