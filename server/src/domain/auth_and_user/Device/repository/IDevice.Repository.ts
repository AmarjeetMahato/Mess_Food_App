import { DeviceInsert, DeviceRow } from "@/config/models";
import { DeviceEntity } from "../entity/Device.Entity";

export interface IDeviceRepository {
 
  // ── Find ───────────────────────────────────────────────────────────
  findById(id: string):         Promise<DeviceEntity | null>;
  findByToken(token: string):   Promise<DeviceEntity | null>;
  findByUserId(userId: string): Promise<DeviceRow[]>;
  // returns DeviceRow[] for list — mapper called at service layer
 
  // ── Create / Update ────────────────────────────────────────────────
  upsertDevice(data: DeviceInsert): Promise<DeviceRow>;
  // device_token has uniqueIndex — if token exists → update
  // if token is new → insert fresh row
 
  // ── Status ─────────────────────────────────────────────────────────
  markTrusted(deviceId: string):        Promise<void>;
  deactivate(deviceId: string):         Promise<void>;
  deactivateAllForUser(userId: string): Promise<void>;
 
  // ── Last seen ──────────────────────────────────────────────────────
  updateLastSeen(deviceId: string): Promise<void>;
}
 