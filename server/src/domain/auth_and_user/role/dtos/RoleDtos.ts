// src/modules/auth_and_users/dto/role.dto.ts
// Zod v4 compatible

import { z } from 'zod';

// ─── Seeded role names — never changed at runtime ─────────────────────────────
// Only admin can create custom roles — but these three are always present
export const ROLE_NAMES = ['admin', 'user', 'driver'] as const;
export type  RoleName   = typeof ROLE_NAMES[number];

// ─── Reusable field schemas ────────────────────────────────────────────────────

const roleNameSchema = z
  .string({ error: 'Role name is required' })
  .min(2,  'Role name must be at least 2 characters')
  .max(50, 'Role name must not exceed 50 characters')
  .regex(
    /^[a-z_]+$/,
    'Role name must be lowercase letters and underscores only — e.g. admin, mess_manager',
  )
  .transform((val) => val.trim().toLowerCase());

const descriptionSchema = z
  .string()
  .max(255, 'Description must not exceed 255 characters')
  .transform((val) => val.trim())
  .optional();

// ─── Request Schemas ──────────────────────────────────────────────────────────

// ── Create role (admin only) ───────────────────────────────────────────────────
export const CreateRoleSchema = z.object({
  name:        roleNameSchema,
  description: descriptionSchema,
});

// ── Update role (admin only) ───────────────────────────────────────────────────
export const UpdateRoleSchema = z.object({
  description: descriptionSchema,

  is_active: z
    .boolean({ error: 'is_active must be a boolean' })
    .optional(),
}).refine(
  (data) => Object.keys(data).filter((k) => data[k as keyof typeof data] !== undefined).length > 0,
  { message: 'At least one field must be provided to update' },
);
// Note: name is intentionally excluded from update
// Role names are immutable after creation — changing them breaks all user assignments

// ── Get role by ID (route param) ──────────────────────────────────────────────
export const GetRoleSchema = z.object({
  id: z.uuid('Invalid role ID format'),
});

// ── Assign role to user (admin only) ─────────────────────────────────────────
export const AssignRoleSchema = z.object({
  user_id: z.uuid('Invalid user ID format'),
  role_id: z.uuid('Invalid role ID format'),
});

// ── List roles query ──────────────────────────────────────────────────────────
export const ListRolesSchema = z.object({
  is_active: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;
export type GetRoleDto    = z.infer<typeof GetRoleSchema>;
export type AssignRoleDto = z.infer<typeof AssignRoleSchema>;
export type ListRolesDto  = z.infer<typeof ListRolesSchema>;

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface RoleResponseDto {
  id:          string;
  name:        string;
  description: string | null;
  is_active:   boolean;
  created_at:  string;
  updated_at:  string;
}

export interface RoleListResponseDto {
  roles: RoleResponseDto[];
  total: number;
}