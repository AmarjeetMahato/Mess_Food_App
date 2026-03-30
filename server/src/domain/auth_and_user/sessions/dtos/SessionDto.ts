// src/modules/auth_and_users/dto/session.dto.ts
// Zod v4 compatible

import { z } from 'zod';

// ─── Request Schemas ──────────────────────────────────────────────────────────

// ── Get session by ID (route param) ──────────────────────────────────────────
export const GetSessionSchema = z.object({
  id: z.uuid('Invalid session ID format'),
});

// ── Revoke a specific session ─────────────────────────────────────────────────
export const RevokeSessionSchema = z.object({
  session_id: z.uuid('Invalid session ID format'),
});

// ── Refresh tokens ────────────────────────────────────────────────────────────
export const RefreshSessionSchema = z.object({
  refresh_token: z
    .string({ error: 'Refresh token is required' })
    .min(1, 'Refresh token cannot be empty'),
});

// ── List sessions query filters ───────────────────────────────────────────────
export const ListSessionsSchema = z.object({
  is_active: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  // query params arrive as strings — coerce to boolean
});

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type GetSessionDto     = z.infer<typeof GetSessionSchema>;
export type RevokeSessionDto  = z.infer<typeof RevokeSessionSchema>;
export type RefreshSessionDto = z.infer<typeof RefreshSessionSchema>;
export type ListSessionsDto   = z.infer<typeof ListSessionsSchema>;

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface SessionResponseDto {
  id:           string;
  device_id:    string | null;
  device_name:  string | null;   // joined from devices table
  device_type:  string | null;   // joined from devices table
  ip_address:   string | null;
  user_agent:   string | null;
  is_active:    boolean;
  is_current:   boolean;         // true = this is the session making the request
  expires_at:   string;
  last_used_at: string;
  created_at:   string;
}

export interface SessionListResponseDto {
  sessions: SessionResponseDto[];
  total:    number;
}

export interface RefreshTokensResponseDto {
  access_token:  string;
  refresh_token: string;
  token_type:    'Bearer';
  expires_in:    number;         // seconds
}