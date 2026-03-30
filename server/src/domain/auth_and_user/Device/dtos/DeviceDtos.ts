// src/modules/auth_and_users/dto/device.dto.ts
// Zod v4 compatible

import { z } from 'zod';

// ─── Reusable field schemas ────────────────────────────────────────────────────

const deviceTypeValues = ['mobile', 'tablet', 'desktop', 'unknown'] as const;
const platformValues   = ['android', 'ios', 'web', 'unknown']       as const;

// ─── Request Schemas ──────────────────────────────────────────────────────────

// ── Register / upsert a device (sent during login or app launch) ──────────────
export const UpsertDeviceSchema = z.object({
  device_token: z
    .string({ error: 'Device token is required' })
    .min(1,   'Device token cannot be empty')
    .max(500, 'Device token must not exceed 500 characters'),
  // FCM token (Android) or APNS token (iOS)

  device_type: z
    .enum(deviceTypeValues)
    .default('unknown'),

  platform: z
    .enum(platformValues)
    .default('unknown'),

  device_name: z
    .string()
    .min(1,   'Device name cannot be empty')
    .max(255, 'Device name must not exceed 255 characters')
    .optional(),
  // e.g. "Rahul's iPhone 15"

  os_version: z
    .string()
    .min(1,  'OS version cannot be empty')
    .max(50, 'OS version must not exceed 50 characters')
    .optional(),
  // e.g. "iOS 17.4", "Android 14"

  app_version: z
    .string()
    .min(1,  'App version cannot be empty')
    .max(50, 'App version must not exceed 50 characters')
    .optional(),
  // e.g. "2.1.0"
});

// ── Get device by ID (route param) ───────────────────────────────────────────
export const GetDeviceSchema = z.object({
  id: z
    .uuid('Invalid device ID format'),
});

// ── Trust / untrust a device ─────────────────────────────────────────────────
export const UpdateDeviceTrustSchema = z.object({
  device_id: z
    .uuid('Invalid device ID format'),

  is_trusted: z
    .boolean({ error: 'is_trusted must be a boolean' }),
});

// ── Deactivate a specific device ──────────────────────────────────────────────
export const DeactivateDeviceSchema = z.object({
  device_id: z
    .string({ error: 'Device ID is required' })
});

// ── List devices query filters ────────────────────────────────────────────────
export const ListDevicesSchema = z.object({
  is_active: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  // query params come as strings — coerce to boolean

  is_trusted: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),

  platform: z
    .enum(platformValues)
    .optional(),

  device_type: z
    .enum(deviceTypeValues)
    .optional(),
});

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type UpsertDeviceDto        = z.infer<typeof UpsertDeviceSchema>;
export type GetDeviceDto           = z.infer<typeof GetDeviceSchema>;
export type UpdateDeviceTrustDto   = z.infer<typeof UpdateDeviceTrustSchema>;
export type DeactivateDeviceDto    = z.infer<typeof DeactivateDeviceSchema>;
export type ListDevicesDto         = z.infer<typeof ListDevicesSchema>;

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface DeviceResponseDto {
  id:           string;
  device_token: string;
  device_type:  string;
  platform:     string;
  device_name:  string | null;
  os_version:   string | null;
  app_version:  string | null;
  is_trusted:   boolean;
  is_active:    boolean;
  last_seen_at: string;
  created_at:   string;
}

export interface DeviceListResponseDto {
  devices: DeviceResponseDto[];
  total:   number;
}