// src/modules/auth_and_users/dto/otp.dto.ts
// Zod v4 compatible

import { z } from 'zod';

// ─── Reusable field schemas ────────────────────────────────────────────────────

const identifierSchema = z
  .string({ error: 'Identifier is required' })
  .min(1, 'Identifier cannot be empty')
  .max(255, 'Identifier must not exceed 255 characters');
// email or phone — matches otp_tokens.identifier column

const otpCodeSchema = z
  .string({ error: 'OTP is required' })
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain digits only');

const purposeValues = [
  'email_verification',
  'phone_verification',
  'password_reset',
  'new_password',
  'login',
  'device_verification',
] as const;

const channelValues = ['sms', 'email', 'whatsapp'] as const;

// ─── Request Schemas ──────────────────────────────────────────────────────────

// ── Send OTP ──────────────────────────────────────────────────────────────────
export const SendOtpSchema = z.object({
  identifier: identifierSchema,
  // email or phone to send OTP to

  purpose: z.enum(purposeValues, {
    error: `Purpose must be one of: ${purposeValues.join(', ')}`,
  }),

  channel: z
    .enum(channelValues, {
      error: `Channel must be one of: ${channelValues.join(', ')}`,
    })
    .default('sms'),
});

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const VerifyOtpSchema = z.object({
  identifier: identifierSchema,

  otp: otpCodeSchema,

  purpose: z.enum(purposeValues, {
    error: `Purpose must be one of: ${purposeValues.join(', ')}`,
  }),
});

// ── Resend OTP ────────────────────────────────────────────────────────────────
// Same shape as SendOtp but semantically different — enforces cooldown in service
export const ResendOtpSchema = z.object({
  identifier: identifierSchema,

  purpose: z.enum(purposeValues, {
    error: `Purpose must be one of: ${purposeValues.join(', ')}`,
  }),

  channel: z
    .enum(channelValues, {
      error: `Channel must be one of: ${channelValues.join(', ')}`,
    })
    .default('sms'),
});

// ── Validate OTP without consuming it (check before proceeding) ───────────────
export const CheckOtpSchema = z.object({
  identifier: identifierSchema,

  otp: otpCodeSchema,

  purpose: z.enum(purposeValues, {
    error: `Purpose must be one of: ${purposeValues.join(', ')}`,
  }),
});

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type SendOtpDto   = z.infer<typeof SendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
export type ResendOtpDto = z.infer<typeof ResendOtpSchema>;
export type CheckOtpDto  = z.infer<typeof CheckOtpSchema>;

export type OtpPurpose = typeof purposeValues[number];
export type OtpChannel = typeof channelValues[number];
// useful when you need the type elsewhere — e.g. service method params

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface SendOtpResponseDto {
  message:           string;
  expires_in:        number;   // seconds — e.g. 600 for 10 minutes
  channel:           string;   // how it was sent
  resend_allowed_in: number;   // seconds before user can request again — e.g. 60
}

export interface VerifyOtpResponseDto {
  success:    boolean;
  message:    string;
  purpose:    string;
  verified_at: string;         // ISO timestamp
}