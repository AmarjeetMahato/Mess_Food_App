import { DeviceRow } from "@/config/models";
import { DeviceEntity } from "../entity/Device.Entity";
import { DeviceListResponseDto, DeviceResponseDto } from "../dtos/DeviceDtos";


export class DeviceMapper{
      constructor(){}

        // ── DB row → Domain Entity ─────────────────────────────────────────
      static toDomain(row:DeviceRow):DeviceEntity{
              return new DeviceEntity(
      row.id,
      row.user_id,
      row.device_token,
      row.device_type,
      row.platform,
      row.device_name   ?? null,
      row.os_version    ?? null,
      row.app_version   ?? null,
      row.is_trusted,
      row.is_active,
      row.last_seen_at,
      row.created_at,
    );
}


      // ── Domain Entity → Response DTO ───────────────────────────────────
  // device_token included — user needs it to manage their own devices
  // if you want to hide token from list responses use toSafeDto() below
    static toResponseDto(entity:DeviceEntity):DeviceResponseDto{
        return {
      id:           entity.id,
      device_token: entity.device_token,
      device_type:  entity.device_type,
      platform:     entity.platform,
      device_name:  entity.deviceName,
      os_version:   entity.osVersion,
      app_version:  entity.appVersion,
      is_trusted:   entity.isTrusted,
      is_active:    entity.isActive,
      last_seen_at: entity.lastSeenAt.toISOString(),
      created_at:   entity.createdAt.toISOString(),
    };
    }

      // ── DB row → Response DTO (shortcut for list queries) ──────────────
     static rowToResponseDto(row: DeviceRow): DeviceResponseDto {
    return DeviceMapper.toResponseDto(DeviceMapper.toDomain(row));
  }

    // ── List of rows → DeviceListResponseDto ───────────────────────────
  static toListResponseDto(rows: DeviceRow[]): DeviceListResponseDto {
    return {
      devices: rows.map(DeviceMapper.rowToResponseDto),
      total:   rows.length,
    };
  }

}