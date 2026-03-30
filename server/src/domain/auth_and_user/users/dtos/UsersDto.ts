// src/modules/user/dto/user.dto.ts
// Zod v4 compatible

import { z } from 'zod';

// ─── Reusable field schemas ────────────────────────────────────────────────────

const nameSchema = z
  .string({ error: 'Name is required' })
  .min(2,   'Name must be at least 2 characters')
  .max(255, 'Name must not exceed 255 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes')
  .transform((val) => val.trim());

const avatarUrlSchema = z
  .url('Invalid avatar URL')
  .max(500, 'Avatar URL must not exceed 500 characters')
  .optional();

// ─── Request Schemas ──────────────────────────────────────────────────────────

// ── Get user by ID (route param) ──────────────────────────────────────────────
export const GetUserSchema = z.object({
  id: z.uuid('Invalid user ID format'),
});

// ── Update own profile ────────────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  name:       nameSchema.optional(),
  avatar_url: avatarUrlSchema,
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided to update' },
);

// ── Update user status (admin only) ───────────────────────────────────────────
export const UpdateUserStatusSchema = z.object({
  status: z.enum(
    ['active', 'inactive', 'banned', 'pending_verification'],
    { error: 'Invalid status value' },
  ),
  reason: z
    .string()
    .max(500, 'Reason must not exceed 500 characters')
    .optional(),
});

// ── List users with filters (admin only) ──────────────────────────────────────
export const ListUsersSchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer')
    .positive('Page must be greater than 0')
    .default(1),

  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1,   'Limit must be at least 1')
    .max(100, 'Limit must not exceed 100')
    .default(20),

  status: z.enum(
    ['active', 'inactive', 'banned', 'pending_verification'],
    { error: 'Invalid status value' },
  ).optional(),

  role_id: z.uuid('Invalid role ID format').optional(),

  search: z
    .string()
    .max(100, 'Search query must not exceed 100 characters')
    .transform((val) => val.trim())
    .optional(),
});

// ── Change password ────────────────────────────────────────────────────────────
export const ChangePasswordSchema = z.object({
  current_password: z
    .string({ error: 'Current password is required' })
    .min(1, 'Current password cannot be empty'),

  new_password: z
    .string({ error: 'New password is required' })
    .min(8,   'Password must be at least 8 characters')
    .max(72,  'Password must not exceed 72 characters')
    .regex(/[A-Z]/,        'Must contain at least one uppercase letter')
    .regex(/[a-z]/,        'Must contain at least one lowercase letter')
    .regex(/[0-9]/,        'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),

  confirm_password: z
    .string({ error: 'Please confirm your new password' })
    .min(1, 'Confirm password cannot be empty'),

}).refine(
  (data) => data.new_password === data.confirm_password,
  { message: 'Passwords do not match', path: ['confirm_password'] },
).refine(
  (data) => data.current_password !== data.new_password,
  { message: 'New password must be different from current password', path: ['new_password'] },
);

// ── Delete account ─────────────────────────────────────────────────────────────
export const DeleteAccountSchema = z.object({
  password: z
    .string({ error: 'Password is required to delete your account' })
    .min(1, 'Password cannot be empty'),
  // confirm identity before deletion
});

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type GetUserDto            = z.infer<typeof GetUserSchema>;
export type UpdateProfileDto      = z.infer<typeof UpdateProfileSchema>;
export type UpdateUserStatusDto   = z.infer<typeof UpdateUserStatusSchema>;
export type ListUsersDto          = z.infer<typeof ListUsersSchema>;
export type ChangePasswordDto     = z.infer<typeof ChangePasswordSchema>;
export type DeleteAccountDto      = z.infer<typeof DeleteAccountSchema>;

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface UserResponseDto {
  id:                string;
  name:              string;
  email:             string | null;
  phone:             string | null;
  role_id:           string;
  role_name:         string;
  status:            string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  avatar_url:        string | null;
  last_login_at:     string | null;
  created_at:        string;
  updated_at:        string;
}

export interface UserListResponseDto {
  users:       UserResponseDto[];
  total:       number;
  page:        number;
  limit:       number;
  total_pages: number;
}