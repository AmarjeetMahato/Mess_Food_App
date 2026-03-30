// src/modules/auth_and_users/auth.types.ts
// Re-exports only the types needed by shared interfaces
// Breaks the potential circular import chain
// shared/interfaces → auth.types (no further imports)
// auth.types → auth.dto (only type imports, safe)

export type {
  RegisterDto,
  AuthResponseDto,
  AuthTokensDto,
  AuthUserDto,
  SessionDto,
  OtpResponseDto,
  EmailLoginDto,
  PhoneLoginDto,
  OauthLoginDto,
  RefreshTokenDto,
  LogoutDto,
  RevokeSessionDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SendOtpDto,
  VerifyOtpDto,
} from './AuthDtos';