import { OtpTokenInsert, OtpTokenRow } from "@/config/models";
import { OtpPurpose } from "../dtos/OtpDtos";


export interface IOtpRepository {

  // ── Create ─────────────────────────────────────────────────────────
  createOtp(data: OtpTokenInsert): Promise<OtpTokenRow>;
  // inserts a new OTP row — always create fresh, never reuse

  // ── Find ───────────────────────────────────────────────────────────
  findLatestByIdentifierAndPurpose(identifier: string, purpose:OtpPurpose,): Promise<OtpTokenRow | null>;
  // most common query — uses composite index
  // otp_identifier_purpose_used_idx

  findById(id: string): Promise<OtpTokenRow | null>;
  // used after verify — to mark as used

  // ── Update ─────────────────────────────────────────────────────────
  markAsUsed(otpId: string): Promise<void>;
  // sets is_used = true, used_at = now()

  incrementAttempts(otpId: string): Promise<void>;
  // called on every wrong OTP entry
  // service blocks after MAX_ATTEMPTS (5)

  updateLastRequestedAt(identifier: string, purpose:OtpPurpose,): Promise<void>;
  // called on every send/resend
  // service reads this to enforce 60s cooldown

  // ── Invalidate ─────────────────────────────────────────────────────
  invalidatePreviousOtps(identifier: string, purpose:    OtpPurpose,): Promise<void>;
  // marks all existing unused OTPs as used before creating a new one
  // prevents multiple valid OTPs existing at the same time
}
