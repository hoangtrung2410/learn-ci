export interface IJwtPayload extends IPreJwtPayload {
  iat: number;
  exp: number;
}

export interface IJwtRefreshPayload {
  sub: string;
  issuedAt: number;
}

export interface IPreJwtPayload {
  sub: string;
  name: string;
  id: string;
  issuedAt: number;
  pol: string;
}
