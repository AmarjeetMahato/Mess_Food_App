// src/modules/auth_and_users/session.mapper.ts

import { DeviceRow, SessionRow } from "@/config/models";
import { SessionEntity } from "../entity/Session.Entity";
import { TokenUtil } from "@/utils/jwtTokens";
import { SessionResponseDto, SessionListResponseDto, RefreshTokensResponseDto } from "../dtos/SessionDto";



export class SessionMapper {

  // ── DB row → Domain Entity ─────────────────────────────────────────
  static toDomain(row: SessionRow): SessionEntity {
    return new SessionEntity(
      row.id,
      row.user_id,
      row.device_id          ?? null,
      row.refresh_token_hash,
      row.access_token_jti,
      row.ip_address         ?? null,
      row.user_agent         ?? null,
      row.is_active,
      row.expires_at,
      row.last_used_at,
      row.created_at,
    );
  }

  // ── Domain Entity + device row → Response DTO ──────────────────────
  // device is joined separately — session table has no device columns
  static toResponseDto(
    entity:     SessionEntity,
    currentJti: string,
    device?:    DeviceRow | null,
  ): SessionResponseDto {
    return {
      id:           entity.id,
      device_id:    entity.deviceId,
      device_name:  device?.device_name  ?? null,
      device_type:  device?.device_type  ?? null,
      ip_address:   entity.ipAddress,
      user_agent:   entity.userAgent,
      is_active:    entity.isActive,
      is_current:   entity.isCurrent(currentJti),
      expires_at:   entity.expiresAt.toISOString(),
      last_used_at: entity.lastUsedAt.toISOString(),
      created_at:   entity.createdAt.toISOString(),
    };
  }

  // ── DB row + device row → Response DTO (shortcut) ──────────────────
  static rowToResponseDto(
    row:        SessionRow,
    currentJti: string,
    device?:    DeviceRow | null,
  ): SessionResponseDto {
    return SessionMapper.toResponseDto(
      SessionMapper.toDomain(row),
      currentJti,
      device,
    );
  }

  // ── List of rows → SessionListResponseDto ──────────────────────────
  // deviceMap: pre-fetched devices keyed by device_id
  // avoids N+1 — fetch all devices once, pass as a map
  static toListResponseDto(
    rows:       SessionRow[],
    currentJti: string,
    deviceMap:  Map<string, DeviceRow> = new Map(),
  ): SessionListResponseDto {
    return {
      sessions: rows.map((row) =>
        SessionMapper.rowToResponseDto(
          row,
          currentJti,
          row.device_id ? deviceMap.get(row.device_id) ?? null : null,
        ),
      ),
      total: rows.length,
    };
  }

  // ── Build RefreshTokensResponseDto ─────────────────────────────────
  // Called after token rotation — new access + refresh tokens issued
  static toRefreshResponse(
    accessToken:  string,
    refreshToken: string,
  ): RefreshTokensResponseDto {
    return {
      access_token:  accessToken,
      refresh_token: refreshToken,
      token_type:    'Bearer',
      expires_in:    TokenUtil.getAccessTokenExpiresIn(),
    };
  }
}