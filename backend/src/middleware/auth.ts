export interface JWTPayload {
  userId: string;
  walletAddress: string;
}

export interface AuthenticatedRequest extends Request {
  user: JWTPayload;
}
