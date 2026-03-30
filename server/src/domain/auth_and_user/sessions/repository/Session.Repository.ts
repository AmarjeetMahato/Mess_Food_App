// src/modules/auth_and_users/session.repository.ts

import type { DbOrTx } from "@/config/database/database";
import { Session, SessionRow, SessionInsert } from "@/config/models";
import { TOKENS } from "@/helper/user_and_auth/token";
import { eq, and, ne } from "drizzle-orm";
import { injectable, inject } from "tsyringe";
import { SessionEntity } from "../entity/Session.Entity";
import { SessionMapper } from "../mapper/Session.Mapper";
import { ISessionRepository } from "./ISession.Repository";
import { InternalServerError } from "@/globalError/AppError";


@injectable()
export class SessionRepository implements ISessionRepository {

  constructor(
    @inject(TOKENS.DB) private readonly db: DbOrTx,
  ) {}

  // ── Find by ID ─────────────────────────────────────────────────────
  async findById(id: string): Promise<SessionEntity | null> {
    const [row] = await this.db
      .select()
      .from(Session)
      .where(eq(Session.id, id))
      .limit(1);

    if (!row) return null;
    return SessionMapper.toDomain(row);
  }

  // ── Find by refresh token hash ─────────────────────────────────────
  // Most frequent query — hits session_refresh_token_hash_udx unique index
  // Called on every token refresh request
  async findByRefreshTokenHash(hash: string): Promise<SessionEntity | null> {
    const [row] = await this.db
      .select()
      .from(Session)
      .where(
        and(
          eq(Session.refresh_token_hash, hash),
          eq(Session.is_active, true),
        ),
      )
      .limit(1);

    if (!row) return null;
    return SessionMapper.toDomain(row);
  }

  // ── Find by JTI ────────────────────────────────────────────────────
  // Used to validate access token against an active session
  // Hits session_jti_idx index
  async findByJti(jti: string): Promise<SessionEntity | null> {
    const [row] = await this.db
      .select()
      .from(Session)
      .where(
        and(
          eq(Session.access_token_jti, jti),
          eq(Session.is_active, true),
        ),
      )
      .limit(1);

    if (!row) return null;
    return SessionMapper.toDomain(row);
  }

  // ── Find all active sessions for a user ────────────────────────────
  // Returns raw rows — deviceMap built at service layer to avoid N+1
  // Hits session_user_active_idx composite index
  async findActiveByUserId(userId: string): Promise<SessionRow[]> {
    return this.db
      .select()
      .from(Session)
      .where(
        and(
          eq(Session.user_id,  userId),
          eq(Session.is_active, true),
        ),
      );
  }

  // ── Create session ─────────────────────────────────────────────────
  // Called on every successful login
  async create(data: SessionInsert): Promise<SessionRow> {
    const [row] = await this.db
      .insert(Session)
      .values(data)
      .returning();

   if(!row){
      throw new InternalServerError("Failed to create session")
   }   
    return row;
  }

  // ── Update last used ───────────────────────────────────────────────
  // Called on authenticated requests
  // Service skips this if entity.wasRecentlyUsed() returns true
  async updateLastUsed(sessionId: string): Promise<void> {
    await this.db
      .update(Session)
      .set({ last_used_at: new Date() })
      .where(eq(Session.id, sessionId));
  }

  // ── Update JTI ─────────────────────────────────────────────────────
  // Called on token rotation — new access token carries a new jti
  async updateJti(sessionId: string, jti: string): Promise<void> {
    await this.db
      .update(Session)
      .set({ access_token_jti: jti })
      .where(eq(Session.id, sessionId));
  }

  // ── Update refresh token hash ──────────────────────────────────────
  // Called on token rotation — old refresh token invalidated
  // New hash stored alongside updated expiry
  async updateRefreshTokenHash(
    sessionId: string,
    hash:      string,
    expiresAt: Date,
  ): Promise<void> {
    await this.db
      .update(Session)
      .set({
        refresh_token_hash: hash,
        expires_at:         expiresAt,
        last_used_at:       new Date(),
      })
      .where(eq(Session.id, sessionId));
  }

  // ── Revoke single session ──────────────────────────────────────────
  // Soft deactivate — never hard delete, kept for audit trail
  async revoke(sessionId: string): Promise<void> {
    await this.db
      .update(Session)
      .set({ is_active: false })
      .where(eq(Session.id, sessionId));
  }

  // ── Revoke all sessions for a user ────────────────────────────────
  // Called on logout-all — one UPDATE hits all rows for the user
  async revokeAllForUser(userId: string): Promise<void> {
    await this.db
      .update(Session)
      .set({ is_active: false })
      .where(
        and(
          eq(Session.user_id,  userId),
          eq(Session.is_active, true),
        ),
      );
  }

  // ── Revoke all sessions except current ────────────────────────────
  // Called on "logout all other devices"
  // Keeps the current session alive — ne() = NOT EQUAL
  async revokeAllForUserExcept(
    userId:    string,
    sessionId: string,
  ): Promise<void> {
    await this.db
      .update(Session)
      .set({ is_active: false })
      .where(
        and(
          eq(Session.user_id,   userId),
          eq(Session.is_active, true),
          ne(Session.id,        sessionId),
          // ne = not equal — excludes current session from revocation
        ),
      );
  }
}