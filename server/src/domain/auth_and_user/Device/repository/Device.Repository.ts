import { inject, injectable } from "tsyringe";
import { IDeviceRepository } from "./IDevice.Repository";
import { DeviceRow, DeviceInsert, Device } from "@/config/models";
import { TOKENS } from "@/helper/user_and_auth/token";
import {type DbOrTx } from "@/config/database/database";
import { eq , and} from "drizzle-orm";
import { DeviceEntity } from "../entity/Device.Entity";
import { DeviceMapper } from "../mapper/Device.Mapper";


@injectable()
export class DeviceRepository implements IDeviceRepository {
 
  constructor(
    @inject(TOKENS.DB) private readonly db: DbOrTx,
  ) {}
 
  // ── Find by ID ─────────────────────────────────────────────────────
  async findById(id: string): Promise<DeviceEntity | null> {
    const [row] = await this.db
      .select()
      .from(Device)
      .where(eq(Device.id, id))
      .limit(1);
 
    if (!row) return null;
    return DeviceMapper.toDomain(row);
  }
 
  // ── Find by FCM / APNS token ───────────────────────────────────────
  async findByToken(token: string): Promise<DeviceEntity | null> {
    const [row] = await this.db
      .select()
      .from(Device)
      .where(eq(Device.device_token, token))
      .limit(1);
 
    if (!row) return null;
    return DeviceMapper.toDomain(row);
  }
 
  // ── Find all devices for a user ────────────────────────────────────
  async findByUserId(userId: string): Promise<DeviceRow[]> {
    return this.db
      .select()
      .from(Device)
      .where(
        and(
          eq(Device.user_id,  userId),
          eq(Device.is_active, true),
        ),
      );
    // returns raw rows — mapper called at service layer
    // allows service to build DeviceListResponseDto with total count
  }
 
  // ── Upsert device ──────────────────────────────────────────────────
  // device_token has uniqueIndex so onConflictDoUpdate targets it
  // if token exists → update mutable fields only
  // if token is new → insert full row
  async upsertDevice(data: DeviceInsert): Promise<DeviceRow> {
    const [row] = await this.db
      .insert(Device)
      .values(data)
      .onConflictDoUpdate({
        target: Device.device_token,
        set: {
          // Fields that can legitimately change on re-login
          device_type:  data.device_type,
          platform:     data.platform,
          device_name:  data.device_name,
          os_version:   data.os_version,
          app_version:  data.app_version,
          is_active:    true,             // reactivate if previously deactivated
          last_seen_at: new Date(),
        },
      })
      .returning();

      if(!row) {
           throw new Error("Failed to create ")
      }
 
    return row;
  }
 
  // ── Mark device as trusted ─────────────────────────────────────────
  // trusted device skips 2FA on next login
  async markTrusted(deviceId: string): Promise<void> {
    await this.db
      .update(Device)
      .set({ is_trusted: true })
      .where(eq(Device.id, deviceId));
  }
 
  // ── Deactivate a single device ─────────────────────────────────────
  // soft delete — keeps the row for audit history
  async deactivate(deviceId: string): Promise<void> {
    await this.db
      .update(Device)
      .set({
        is_active:  false,
        is_trusted: false,  // untrust on deactivation for security
      })
      .where(eq(Device.id, deviceId));
  }
 
  // ── Deactivate all devices for a user ──────────────────────────────
  // called on logout-all — revokes all sessions and devices together
  async deactivateAllForUser(userId: string): Promise<void> {
    await this.db
      .update(Device)
      .set({
        is_active:  false,
        is_trusted: false,
      })
      .where(eq(Device.user_id, userId));
  }
 
  // ── Update last seen timestamp ─────────────────────────────────────
  // called on every authenticated request to track device activity
  async updateLastSeen(deviceId: string): Promise<void> {
    await this.db
      .update(Device)
      .set({ last_seen_at: new Date() })
      .where(eq(Device.id, deviceId));
  }
}