// src/shared/interfaces/ISessionRepository.ts

import { SessionInsert, SessionRow } from "@/config/models";
import { SessionEntity } from "../entity/Session.Entity";

export interface ISessionRepository {

  // ── Find ───────────────────────────────────────────────────────────
  findById(id: string): Promise<SessionEntity | null>;

  findByRefreshTokenHash(hash: string): Promise<SessionEntity | null>;
  // most common query on token refresh — uses unique index

  findByJti(jti: string): Promise<SessionEntity | null>;
  // used to validate access token against active session

  findActiveByUserId(userId: string): Promise<SessionRow[]>;
  // returns raw rows — deviceMap built at service layer to avoid N+1

  // ── Create ─────────────────────────────────────────────────────────
  create(data: SessionInsert): Promise<SessionRow>;
  // called on every login — creates a fresh session row

  // ── Update ─────────────────────────────────────────────────────────
  updateLastUsed(sessionId: string): Promise<void>;
  // called on every authenticated request
  // wasRecentlyUsed() on entity prevents unnecessary writes

  updateJti(sessionId: string, jti: string): Promise<void>;
  // called on token rotation — new access token = new jti

  updateRefreshTokenHash(sessionId: string,hash:string, expiresAt: Date): Promise<void>;
  // called on token rotation — old refresh token replaced with new hash

  // ── Revoke ─────────────────────────────────────────────────────────
  revoke(sessionId: string): Promise<void>;
  // soft deactivate — sets is_active = false
  // never hard delete — keep for audit trail

  revokeAllForUser(userId: string): Promise<void>;
  // called on logout-all — revokes every active session

  revokeAllForUserExcept(userId:string, sessionId:string): Promise<void>;
  // called on "logout all other devices" — keeps current session active
}