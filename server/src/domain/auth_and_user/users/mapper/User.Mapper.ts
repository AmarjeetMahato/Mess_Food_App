// src/modules/user/user.mapper.ts

import { UserRow, RoleRow } from "@/config/models";
import { UserResponseDto, UserListResponseDto } from "../dtos/UsersDto";
import { UserEntity } from "../entity/User.Entity";


export class UserMapper {

  // ── DB row + role row → Domain Entity ─────────────────────────────
  static toDomain(user: UserRow, role: RoleRow): UserEntity {
    return new UserEntity(
      user.id,
      user.name,
      user.email          ?? null,
      user.phone          ?? null,
      user.password_hash  ?? null,
      user.role_id,
      role.name,
      user.status,
      user.is_email_verified,
      user.is_phone_verified,
      user.avatar_url     ?? null,
      user.last_login_at  ?? null,
      user.created_at,
      user.updated_at,
    );
  }

  // ── Domain Entity → Response DTO ───────────────────────────────────
  // password_hash never leaves this layer
  static toResponseDto(entity: UserEntity): UserResponseDto {
    return {
      id:                entity.id,
      name:              entity.name,
      email:             entity.email,
      phone:             entity.phone,
      role_id:           entity.roleId,
      role_name:         entity.roleName,
      status:            entity.status,
      is_email_verified: entity.isEmailVerified,
      is_phone_verified: entity.isPhoneVerified,
      avatar_url:        entity.avatarUrl,
      last_login_at:     entity.lastLoginAt?.toISOString() ?? null,
      created_at:        entity.createdAt.toISOString(),
      updated_at:        entity.updatedAt.toISOString(),
    };
  }

  // ── DB row + role → Response DTO (shortcut) ────────────────────────
  static rowToResponseDto(user: UserRow, role: RoleRow): UserResponseDto {
    return UserMapper.toResponseDto(UserMapper.toDomain(user, role));
  }

  // ── List → UserListResponseDto ─────────────────────────────────────
  static toListResponseDto(
    users:      Array<{ user: UserRow; role: RoleRow }>,
    total:      number,
    page:       number,
    limit:      number,
  ): UserListResponseDto {
    return {
      users:       users.map(({ user, role }) => UserMapper.rowToResponseDto(user, role)),
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }
}