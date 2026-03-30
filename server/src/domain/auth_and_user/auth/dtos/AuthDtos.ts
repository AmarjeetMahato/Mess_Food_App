import { z } from 'zod';

const emailSchema = z
  .email('Invalid email address')
  .max(255, 'Email must not exceed 255 characters')
  .transform((val) => val.toLowerCase().trim());

const phoneSchema = z
  .string({ error: 'Phone number is required' })
  .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number');

const passwordSchema = z
  .string({ error: 'Password is required' })
  .min(8,  'Password must be at least 8 characters')
  .max(72, 'Password must not exceed 72 characters')
  .regex(/[A-Z]/,        'Must contain uppercase letter')
  .regex(/[a-z]/,        'Must contain lowercase letter')
  .regex(/[0-9]/,        'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');

const otpSchema = z
  .string({ error: 'OTP is required' })
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only digits');

const DeviceSchema = z.object({
  token:       z.string({ error: 'Device token is required' }).min(1),
  device_type: z.enum(['mobile', 'tablet', 'desktop', 'unknown']).default('unknown'),
  device_name: z.string().max(255).optional(),
  os:          z.string().max(100).optional(),
  app_version: z.string().max(50).optional(),
}).optional();

export const RegisterSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .min(2).max(255)
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes')
    .transform((val) => val.trim()),
  email:    emailSchema.optional(),
  phone:    phoneSchema.optional(),
  password: passwordSchema.optional(),
}).refine(
  (d) => d.email || d.phone,
  { message: 'At least one of email or phone is required', path: ['email'] }
).refine(
  (d) => !(d.email && !d.password),
  { message: 'Password is required when registering with email', path: ['password'] }
);

export const EmailLoginSchema = z.object({
  email:    emailSchema,
  password: z.string({ error: 'Password is required' }).min(1),
  device:   DeviceSchema,
});

export const PhoneLoginSchema = z.object({
  phone:  phoneSchema,
  otp:    otpSchema,
  device: DeviceSchema,
});

export const SendOtpSchema = z.object({
  phone:   phoneSchema,
  purpose: z.enum(['phone_verification', 'login', 'password_reset', 'new_password', 'device_verification']),
  channel: z.enum(['sms', 'email', 'whatsapp']).default('sms'),
});

export const VerifyOtpSchema = z.object({
  identifier: z.string({ error: 'Identifier is required' }).min(1),
  otp:        otpSchema,
  purpose:    z.enum(['email_verification', 'phone_verification', 'login', 'password_reset', 'new_password', 'device_verification']),
});

export const OauthLoginSchema = z.object({
  provider:     z.enum(['google', 'facebook', 'apple']),
  id_token:     z.string({ error: 'ID token is required' }).min(1),
  access_token: z.string().min(1).optional(),
  device:       DeviceSchema,
}).refine(
  (d) => !(d.provider === 'facebook' && !d.access_token),
  { message: 'access_token is required for Facebook login', path: ['access_token'] }
);

export const RefreshTokenSchema  = z.object({ refresh_token: z.string({ error: 'Refresh token is required' }).min(1) });
export const LogoutSchema        = z.object({ refresh_token: z.string({ error: 'Refresh token is required' }).min(1) });
export const RevokeSessionSchema = z.object({ session_id:    z.string({ error: 'Session ID is required' }).uuid('Invalid session ID format') });

export const ForgotPasswordSchema = z.object({
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
}).refine((d) => d.email || d.phone, { message: 'Either email or phone is required', path: ['email'] });

export const ResetPasswordSchema = z.object({
  identifier:       z.string({ error: 'Identifier is required' }).min(1),
  otp:              otpSchema,
  new_password:     passwordSchema,
  confirm_password: z.string({ error: 'Please confirm your new password' }).min(1),
}).refine((d) => d.new_password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] });

export type RegisterDto       = z.infer<typeof RegisterSchema>;
export type EmailLoginDto     = z.infer<typeof EmailLoginSchema>;
export type PhoneLoginDto     = z.infer<typeof PhoneLoginSchema>;
export type SendOtpDto        = z.infer<typeof SendOtpSchema>;
export type VerifyOtpDto      = z.infer<typeof VerifyOtpSchema>;
export type OauthLoginDto     = z.infer<typeof OauthLoginSchema>;
export type RefreshTokenDto   = z.infer<typeof RefreshTokenSchema>;
export type LogoutDto         = z.infer<typeof LogoutSchema>;
export type RevokeSessionDto  = z.infer<typeof RevokeSessionSchema>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordDto  = z.infer<typeof ResetPasswordSchema>;

export interface AuthTokensDto {
  access_token: string; refresh_token: string; token_type: 'Bearer'; expires_in: number;
}
export interface AuthUserDto {
  id: string; name: string; email: string | null; phone: string | null;
  role: string; status: string; is_email_verified: boolean; is_phone_verified: boolean; avatar_url: string | null;
}
export interface AuthResponseDto {
  user: AuthUserDto; tokens: AuthTokensDto; device_id: string | null; is_new_user: boolean;
}
export interface SessionDto {
  id: string; device_name: string | null; device_type: string;
  ip_address: string | null; last_used_at: string; created_at: string; is_current: boolean;
}
export interface OtpResponseDto { message: string; expires_in: number; channel: string; }