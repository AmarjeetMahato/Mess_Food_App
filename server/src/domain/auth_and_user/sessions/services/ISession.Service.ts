// src/shared/interfaces/ISessionService.ts

import { SessionResponseDto, SessionListResponseDto, RefreshSessionDto, RefreshTokensResponseDto, RevokeSessionDto } from "../dtos/SessionDto";

export interface ISessionService {

  // ── Read ───────────────────────────────────────────────────────────
  getSessionById( sessionId: string,userId:    string, currentJti: string,): Promise<SessionResponseDto>;

  getActiveSessions(userId: string,currentJti: string): Promise<SessionListResponseDto>;
  // returns all active sessions with device info — no N+1

  // ── Token refresh ──────────────────────────────────────────────────
  refreshTokens(dto: RefreshSessionDto): Promise<RefreshTokensResponseDto>;
  // 1. verify refresh token signature
  // 2. find session by token hash
  // 3. check session is valid (active + not expired)
  // 4. rotate tokens — new access + new refresh
  // 5. update session — new jti + new refresh hash

  // ── Revoke ─────────────────────────────────────────────────────────
  revokeSession(dto: RevokeSessionDto,userId: string): Promise<void>;
  // ownership check — user can only revoke their own sessions

  revokeAllSessions(userId: string): Promise<void>;
  // logout-all — revokes every active session for the user

  revokeAllExceptCurrent(userId:string,sessionId: string): Promise<void>;
  // "logout all other devices" — keeps current session alive

  // ── Last used ──────────────────────────────────────────────────────
  touchSession(sessionId: string, userId:string): Promise<void>;
  // updates last_used_at — skipped if wasRecentlyUsed() returns true
}