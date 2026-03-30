import { ResendOtpDto, SendOtpDto, SendOtpResponseDto, VerifyOtpDto, VerifyOtpResponseDto } from "../dtos/OtpDtos";

export interface IOtpService {
 
  // ── Send ───────────────────────────────────────────────────────────
  sendOtp(dto: SendOtpDto): Promise<SendOtpResponseDto>;
  // 1. enforce cooldown — check last_requested_at
  // 2. invalidate previous unused OTPs for same identifier + purpose
  // 3. generate 6-digit OTP → hash → store
  // 4. dispatch via channel (sms / email / whatsapp)
  // 5. return expires_in + resend_allowed_in
 
  // ── Verify ─────────────────────────────────────────────────────────
  verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto>;
  // 1. find latest unused OTP for identifier + purpose
  // 2. check not expired
  // 3. check attempts < MAX_ATTEMPTS
  // 4. compare hash — increment attempts on wrong
  // 5. mark as used on correct
  // 6. return verified_at timestamp
 
  // ── Resend ─────────────────────────────────────────────────────────
  resendOtp(dto: ResendOtpDto): Promise<SendOtpResponseDto>;
  // same as sendOtp but enforces stricter cooldown check
  // throws TooManyRequestsError if called within cooldown window
}
 