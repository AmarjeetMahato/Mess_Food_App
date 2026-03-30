
import { AuthUserEntity } from "../entity/Auth.Entity";
import { AuthResponseDto, AuthTokensDto, AuthUserDto } from "../dtos/AuthDtos";
import { RoleRow, UserRow } from "@/config/models";


 
export class AuthMapper {
 
  static toDomain(user: UserRow, role: RoleRow): AuthUserEntity {
    return new AuthUserEntity(
      user.id,
      user.name,
      user.email         ?? null,
      user.phone         ?? null,
      user.password_hash ?? null,
      user.role_id,
      role.name,
      user.status,
      user.is_email_verified,
      user.is_phone_verified,
      user.avatar_url    ?? null,
      user.created_at,
      user.updated_at,
    );
  }
 
  static toAuthUserDto(entity: AuthUserEntity): AuthUserDto {
    return {
      id:                entity.id,
      name:              entity.name,
      email:             entity.email,
      phone:             entity.phone,
      role:              entity.roleName,
      status:            entity.status,
      is_email_verified: entity.isEmailVerified,
      is_phone_verified: entity.isPhoneVerified,
      avatar_url:        entity.avatarUrl,
    };
  }
 
  static toAuthResponse(
    entity:    AuthUserEntity,
    tokens:    AuthTokensDto,
    deviceId:  string | null,
    isNewUser: boolean,
  ): AuthResponseDto {
    return {
      user:        AuthMapper.toAuthUserDto(entity),
      tokens,
      device_id:   deviceId,
      is_new_user: isNewUser,
    };
  }
}
 