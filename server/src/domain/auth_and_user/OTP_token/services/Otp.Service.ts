import { TOKENS } from "@/helper/user_and_auth/token";
import { injectable, inject } from "tsyringe";
import { OtpRepository } from "../repository/Otp.Repository";
import { IOtpService } from "./IOtp.Service";
import { SendOtpDto, SendOtpResponseDto, VerifyOtpDto, VerifyOtpResponseDto, ResendOtpDto } from "../dtos/OtpDtos";
import { BadRequestError, NotFoundError, TooManyRequestsError, UnauthorizedError } from "@/globalError/AppError";
import { OtpMapper } from "../mapper/Otp.Mapper";
import { TokenUtil } from "@/utils/jwtTokens";
import bcrypt from "bcryptjs"


// ─── Constants ────────────────────────────────────────────────────────────────
const OTP_EXPIRY_MINUTES  = 10;
const OTP_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS         = 5;
const BCRYPT_ROUNDS        = 10;
// lower rounds than password — OTP is short-lived so speed matters more
 

@injectable()
export class OtpService implements IOtpService{
    constructor(@inject(TOKENS.OtpRepository) private repo: OtpRepository){}
    
      // ── Send OTP ───────────────────────────────────────────────────────
  async sendOtp(dto: SendOtpDto): Promise<SendOtpResponseDto> {
 
    // Step 1 — Check cooldown
    // Find latest OTP for this identifier + purpose to read last_requested_at
    const existing = await this.repo.findLatestByIdentifierAndPurpose(
      dto.identifier,
      dto.purpose,
    );
 
    if (existing) {
      const entity = OtpMapper.toDomain(existing);
 
      if (entity.isCooldownActive(OTP_COOLDOWN_SECONDS)) {
        const waitSeconds = entity.secondsUntilResendAllowed(OTP_COOLDOWN_SECONDS);
        throw new TooManyRequestsError(
          `Please wait ${waitSeconds} seconds before requesting a new OTP`,
        );
      }
    }
 
    // Step 2 — Invalidate all previous unused OTPs
    // Prevents multiple valid OTPs existing at the same time
    await this.repo.invalidatePreviousOtps(dto.identifier, dto.purpose);
 
    // Step 3 — Generate OTP + hash
    const rawOtp  = TokenUtil.generateOtp();
    const otpHash = await bcrypt.hash(rawOtp, BCRYPT_ROUNDS);
 
    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    );
 
    // Step 4 — Store hashed OTP
    const row = await this.repo.createOtp({
      identifier:        dto.identifier,
      token_hash:        otpHash,
      purpose:           dto.purpose,
      channel:           dto.channel,
      expires_at:        expiresAt,
      last_requested_at: new Date(),
      attempts:          0,
      is_used:           false,
    });
 
    // Step 5 — Dispatch OTP via channel
    // TODO: inject SmsProvider / EmailProvider / WhatsAppProvider
    // provider.send(dto.identifier, `Your OTP is: ${rawOtp}`)
    // rawOtp used only here — never stored, never returned in response
    console.log(`[DEV ONLY] OTP for ${dto.identifier}: ${rawOtp}`);
    // Remove console.log in production — use actual provider
 
    // Step 6 — Map to response
    const entity = OtpMapper.toDomain(row);
    return OtpMapper.toSendResponse(entity, dto.channel);
  }
 
  // ── Verify OTP ─────────────────────────────────────────────────────
  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
 
    // Step 1 — Find latest unused OTP
    const row = await this.repo.findLatestByIdentifierAndPurpose(
      dto.identifier,
      dto.purpose,
    );
 
    if (!row) {
      throw new NotFoundError(
        'No active OTP found. Please request a new one.',
      );
    }
 
    const entity = OtpMapper.toDomain(row);
 
    // Step 2 — Check expiry
    if (entity.isExpired()) {
      throw new UnauthorizedError(
        'OTP has expired. Please request a new one.',
      );
    }
 
    // Step 3 — Check already used
    if (entity.isAlreadyUsed()) {
      throw new UnauthorizedError(
        'OTP has already been used. Please request a new one.',
      );
    }
 
    // Step 4 — Check max attempts
    if (entity.hasExceededMaxAttempts(MAX_ATTEMPTS)) {
      throw new TooManyRequestsError(
        `Too many failed attempts. Please request a new OTP.`,
      );
    }
 
    // Step 5 — Compare hash
    const isMatch = await bcrypt.compare(dto.otp, entity.tokenHash);
 
    if (!isMatch) {
      // Increment attempts before throwing
      await this.repo.incrementAttempts(entity.id);
 
      const remaining = entity.remainingAttempts(MAX_ATTEMPTS) - 1;
      throw new UnauthorizedError(
        remaining > 0
          ? `Invalid OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Invalid OTP. No attempts remaining. Please request a new one.',
      );
    }
 
    // Step 6 — Mark as used — OTP is now consumed permanently
    await this.repo.markAsUsed(entity.id);
 
    // Step 7 — Map to response
    return OtpMapper.toVerifyResponse(entity);
  }
 
  // ── Resend OTP ─────────────────────────────────────────────────────
  async resendOtp(dto: ResendOtpDto): Promise<SendOtpResponseDto> {
 
    // Stricter check — resend always enforces cooldown
    // Unlike sendOtp which only checks if a previous OTP exists
    const existing = await this.repo.findLatestByIdentifierAndPurpose(
      dto.identifier,
      dto.purpose,
    );
 
    if (!existing) {
      throw new BadRequestError(
        'No previous OTP found for this identifier. Please use send OTP instead.',
      );
    }
 
    const entity = OtpMapper.toDomain(existing);
 
    // Always enforce cooldown on resend — no exceptions
    if (entity.isCooldownActive(OTP_COOLDOWN_SECONDS)) {
      const waitSeconds = entity.secondsUntilResendAllowed(OTP_COOLDOWN_SECONDS);
      throw new TooManyRequestsError(
        `Please wait ${waitSeconds} seconds before resending OTP.`,
      );
    }
 
    // Delegate to sendOtp — same flow from here
    return this.sendOtp({
      identifier: dto.identifier,
      purpose:    dto.purpose,
      channel:    dto.channel,
    });
  }

}