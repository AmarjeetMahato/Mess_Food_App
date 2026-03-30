// src/modules/auth_and_users/role.mapper.ts

import { RoleRow } from "@/config/models";
import { RoleResponseDto, RoleListResponseDto } from "../dtos/RoleDtos";
import { RoleEntity } from "../entity/Role.Entity";


export class RoleMapper {

  // ── DB row → Domain Entity ─────────────────────────────────────────
  static toDomain(row: RoleRow): RoleEntity {
    return new RoleEntity(
      row.id,
      row.name,
      row.description  ?? null,
      row.is_active,
      row.created_at,
      row.updated_at,
    );
  }

  // ── Domain Entity → Response DTO ───────────────────────────────────
  static toResponseDto(entity: RoleEntity): RoleResponseDto {
    return {
      id:          entity.id,
      name:        entity.name,
      description: entity.description,
      is_active:   entity.isActive,
      created_at:  entity.createdAt.toISOString(),
      updated_at:  entity.updatedAt.toISOString(),
    };
  }

  // ── DB row → Response DTO (shortcut) ───────────────────────────────
  static rowToResponseDto(row: RoleRow): RoleResponseDto {
    return RoleMapper.toResponseDto(RoleMapper.toDomain(row));
  }

  // ── List of rows → RoleListResponseDto ────────────────────────────
  static toListResponseDto(rows: RoleRow[]): RoleListResponseDto {
    return {
      roles: rows.map(RoleMapper.rowToResponseDto),
      total: rows.length,
    };
  }
}