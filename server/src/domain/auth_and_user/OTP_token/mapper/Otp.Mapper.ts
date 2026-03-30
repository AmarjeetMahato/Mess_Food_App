import { OtpTokenRow } from "@/config/models";
import { OtpEntity } from "../entity/OtpEntity";
import { SendOtpResponseDto, VerifyOtpResponseDto } from "../dtos/OtpDtos";


const OTP_EXPIRY_SECONDS    = 10 * 60; // 10 minutes
const OTP_COOLDOWN_SECONDS  = 60;      // 1 minute resend cooldown
 

export class OtpMapper{
      
     constructor(){}

       // ── DB row → Domain Entity ─────────────────────────────────────────
      static toDomain(row:OtpTokenRow):OtpEntity{
               return new OtpEntity(
                       row.id,
                       row.user_id          ?? null,
                       row.identifier,
                       row.token_hash,
                       row.purpose,
                       row.channel,
                       row.attempts,
                       row.is_used,
                       row.expires_at,
                       row.used_at          ?? null,
                       row.last_requested_at ?? null,
                       row.created_at,
               )
      }

        // ── Entity → SendOtpResponseDto ────────────────────────────────────
      static toSendResponse(entity:OtpEntity, channel:string):SendOtpResponseDto{
               return {
                    message:   OtpMapper.buildSendMessage(channel),
                    expires_in:        entity.secondsUntilExpiry(),
                    channel,
                    resend_allowed_in: entity.secondsUntilResendAllowed(OTP_COOLDOWN_SECONDS),
               }
      }

        // ── Entity → VerifyOtpResponseDto ──────────────────────────────────
  static toVerifyResponse(entity: OtpEntity): VerifyOtpResponseDto {
    return {
      success:     true,
      message:     'OTP verified successfully',
      purpose:     entity.purpose,
      verified_at: new Date().toISOString(),
    };
  }
 
  // ── Build send message based on channel ────────────────────────────
  private static buildSendMessage(channel: string): string {
    const messages: Record<string, string> = {
      sms:      'OTP sent via SMS. Valid for 10 minutes.',
      email:    'OTP sent to your email. Valid for 10 minutes.',
      whatsapp: 'OTP sent via WhatsApp. Valid for 10 minutes.',
    };
    return messages[channel] ?? 'OTP sent successfully. Valid for 10 minutes.';
  }
}