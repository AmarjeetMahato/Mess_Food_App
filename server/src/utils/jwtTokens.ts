// src/shared/utils/token.util.ts
// Zero dependency on env.ts — reads process.env directly
// This breaks the circular resolve chain that causes Cannot find name 'TokenUtil'

import jwt    from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// ─── Payload interfaces ────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  sub:      string;   // user id
  role:     string;   // role name — e.g. 'admin', 'user', 'driver'
  jti:      string;   // JWT ID — unique per token, used for session tracking
  session:  string;   // session id — links token to a session row
  iat?:     number;   // issued at (set by jwt.sign automatically)
  exp?:     number;   // expiry (set by jwt.sign automatically)
}

export interface RefreshTokenPayload {
  sub:     string;    // user id
  session: string;    // session id
  jti:     string;    // JWT ID
  iat?:    number;
  exp?:    number;
}

// ─── Token utility ─────────────────────────────────────────────────────────────

export const TokenUtil = {

  // ── Generate access token ────────────────────────────────────────────
  generateAccessToken(
    payload: Omit<AccessTokenPayload, 'jti'>,
  ): { token: string; jti: string } {
    const jti    = uuidv4();
    const secret = process.env.JWT_ACCESS_SECRET!;
    const expiry = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';

    const token = jwt.sign(
      { ...payload, jti },
      secret,
      { expiresIn: expiry } as jwt.SignOptions,
    );

    return { token, jti };
  },

  // ── Generate refresh token ───────────────────────────────────────────
  generateRefreshToken(
    payload: Omit<RefreshTokenPayload, 'jti'>,
  ): { token: string; jti: string } {
    const jti    = uuidv4();
    const secret = process.env.JWT_REFRESH_SECRET!;
    const expiry = process.env.JWT_REFRESH_EXPIRES_IN ?? '30d';

    const token = jwt.sign(
      { ...payload, jti },
      secret,
      { expiresIn: expiry } as jwt.SignOptions,
    );

    return { token, jti };
  },

  // ── Verify access token ──────────────────────────────────────────────
  verifyAccessToken(token: string): AccessTokenPayload {
    const secret = process.env.JWT_ACCESS_SECRET!;
    return jwt.verify(token, secret) as AccessTokenPayload;
  },

  // ── Verify refresh token ─────────────────────────────────────────────
  verifyRefreshToken(token: string): RefreshTokenPayload {
    const secret = process.env.JWT_REFRESH_SECRET!;
    return jwt.verify(token, secret) as RefreshTokenPayload;
  },

  // ── Hash token for DB storage ────────────────────────────────────────
  // Never store raw JWT in DB — always store SHA-256 hash
  // On verify: hash incoming token → compare with stored hash
  hashToken(token: string): string {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  },

  // ── Generate 6-digit OTP ─────────────────────────────────────────────
  // crypto.randomInt is cryptographically secure — not Math.random()
  generateOtp(): string {
    return crypto.randomInt(100_000, 999_999).toString();
  },

  // ── Access token expiry in seconds ───────────────────────────────────
  // Used in AuthTokensDto.expires_in so client knows when to refresh
  getAccessTokenExpiresIn(): number {
    const expiry = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
    const match  = expiry.match(/^(\d+)(m|h|d)$/);
    if (!match) return 15 * 60;

    const value = parseInt(match[1]!, 10);
    const unit  = match[2];

    if (unit === 'm') return value * 60;
    if (unit === 'h') return value * 60 * 60;
    if (unit === 'd') return value * 60 * 60 * 24;

    return 15 * 60; // fallback 15 minutes
  },
};