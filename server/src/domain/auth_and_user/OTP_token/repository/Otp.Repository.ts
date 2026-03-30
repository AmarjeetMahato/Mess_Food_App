import { inject, injectable } from "tsyringe";
import { IOtpRepository } from "./IOtp.Repository";
import { OtpToken, OtpTokenInsert, OtpTokenRow } from "@/config/models";
import { OtpPurpose } from "../dtos/OtpDtos";
import { TOKENS } from "@/helper/user_and_auth/token";
import {type  DbOrTx } from "@/config/database/database";
import { eq, and, desc }      from 'drizzle-orm';
import { InternalServerError } from "@/globalError/AppError";

 
@injectable()
export class OtpRepository implements IOtpRepository {
 
  constructor(
    @inject(TOKENS.DB) private readonly db: DbOrTx,
  ) {}
 
  // ── Create ─────────────────────────────────────────────────────────
  // Always inserts a fresh row — never reuses an existing OTP
  // Call invalidatePreviousOtps() before this to avoid duplicates
 async createOtp(data: OtpTokenInsert): Promise<OtpTokenRow> {
  const [row] = await this.db
    .insert(OtpToken)
    .values(data)
    .returning();

  if (!row) {
    throw new InternalServerError('Failed to create OTP — no row returned');
  }

  return row;
}
 
  // ── Find latest unused OTP for identifier + purpose ────────────────
  // Uses composite index: otp_identifier_purpose_used_idx
  // Most frequent query — called on every OTP verification attempt
  async findLatestByIdentifierAndPurpose(identifier: string, purpose:OtpPurpose): Promise<OtpTokenRow | null> {
    const [row] = await this.db
      .select()
      .from(OtpToken)
      .where(
        and(
          eq(OtpToken.identifier, identifier),
          eq(OtpToken.purpose,    purpose),
          eq(OtpToken.is_used,    false),
        ),
      )
      .orderBy(desc(OtpToken.created_at))
      // latest first — in case multiple unused OTPs exist for same identifier
      .limit(1);
 
    return row ?? null;
  }
 
  // ── Find by ID ─────────────────────────────────────────────────────
  // Used when you already have the OTP id and need to fetch full row
  async findById(id: string): Promise<OtpTokenRow | null> {
    const [row] = await this.db
      .select()
      .from(OtpToken)
      .where(eq(OtpToken.id, id))
      .limit(1);
 
    return row ?? null;
  }
 
  // ── Mark OTP as used ───────────────────────────────────────────────
  // Called immediately after successful verification
  // Sets both is_used = true and used_at = now()
  // is_used for fast index queries, used_at for audit trail
  async markAsUsed(otpId: string): Promise<void> {
    await this.db
      .update(OtpToken)
      .set({
        is_used: true,
        used_at: new Date(),
      })
      .where(eq(OtpToken.id, otpId));
  }
 
  // ── Increment failed attempts ──────────────────────────────────────
  // Called on every wrong OTP entry
  // Service blocks the OTP after MAX_ATTEMPTS (5) by checking this value
  async incrementAttempts(otpId: string): Promise<void> {
    // Read current attempts first then increment
    // Avoids raw SQL — keeps code db-agnostic
    const [current] = await this.db
      .select({ attempts: OtpToken.attempts })
      .from(OtpToken)
      .where(eq(OtpToken.id, otpId))
      .limit(1);
 
    if (!current) return;
 
    await this.db
      .update(OtpToken)
      .set({ attempts: current.attempts + 1 })
      .where(eq(OtpToken.id, otpId));
  }
 
  // ── Update last requested at ───────────────────────────────────────
  // Called every time user requests an OTP for this identifier + purpose
  // Service reads this to enforce 60s cooldown before allowing resend
  async updateLastRequestedAt(
    identifier: string,
    purpose:    OtpPurpose,
  ): Promise<void> {
    await this.db
      .update(OtpToken)
      .set({ last_requested_at: new Date() })
      .where(
        and(
          eq(OtpToken.identifier, identifier),
          eq(OtpToken.purpose,    purpose),
        ),
      );
  }
 
  // ── Invalidate all previous unused OTPs ───────────────────────────
  // Called BEFORE creating a new OTP for the same identifier + purpose
  // Prevents multiple valid OTPs existing at the same time
  // Marks them all as used so they can never be verified
  async invalidatePreviousOtps(
    identifier: string,
    purpose:    OtpPurpose,
  ): Promise<void> {
    await this.db
      .update(OtpToken)
      .set({
        is_used: true,
        used_at: new Date(),
      })
      .where(
        and(
          eq(OtpToken.identifier, identifier),
          eq(OtpToken.purpose,    purpose),
          eq(OtpToken.is_used,    false),
          // only invalidate unused ones — already used ones are fine
        ),
      );
  }
}