import { DeviceListResponseDto, DeviceResponseDto, UpsertDeviceDto } from "../dtos/DeviceDtos";


export interface IDeviceService {
 
  // ── Create / Update ────────────────────────────────────────────────
  upsertDevice(
    userId: string,
    dto:    UpsertDeviceDto,
  ): Promise<DeviceResponseDto>;
  // called during login — registers device or updates existing one
 
  // ── Read ───────────────────────────────────────────────────────────
  getDeviceById(
    deviceId: string,
    userId:   string,
  ): Promise<DeviceResponseDto>;
  // userId passed for ownership check — user can only see their own devices
 
  getUserDevices(userId: string): Promise<DeviceListResponseDto>;
  // returns all active devices for a user
 
  // ── Trust ──────────────────────────────────────────────────────────
  trustDevice(
    deviceId: string,
    userId:   string,
  ): Promise<void>;
  // marks device as trusted — skips 2FA on next login
 
  // ── Deactivate ─────────────────────────────────────────────────────
  deactivateDevice(
    deviceId: string,
    userId:   string,
  ): Promise<void>;
  // removes a single device — user logs out from that device
 
  deactivateAllDevices(userId: string): Promise<void>;
  // removes all devices — called on logout-all
 
  // ── Last seen ──────────────────────────────────────────────────────
  refreshLastSeen(deviceId: string): Promise<void>;
  // called on every authenticated request
}