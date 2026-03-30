// src/shared/interfaces/IUserService.ts

import { UserResponseDto, ListUsersDto, UserListResponseDto, UpdateProfileDto, UpdateUserStatusDto, ChangePasswordDto, DeleteAccountDto } from "../dtos/UsersDto";


export interface IUserService {

  // ── Read ───────────────────────────────────────────────────────────
  getUserById(id: string): Promise<UserResponseDto>;

  getProfile(userId: string): Promise<UserResponseDto>;
  // same as getUserById but scoped to current user
  // kept separate — different auth guard + response shape in future

  getAllUsers(dto: ListUsersDto): Promise<UserListResponseDto>;
  // admin only — paginated list with filters

  // ── Update ─────────────────────────────────────────────────────────
  updateProfile(userId: string,dto:UpdateProfileDto,): Promise<UserResponseDto>;

  updateUserStatus(targetUserId: string,dto: UpdateUserStatusDto,adminId:string,): Promise<UserResponseDto>;
  // admin only — cannot ban yourself

  changePassword(
    userId: string,
    dto:    ChangePasswordDto,
  ): Promise<void>;
  // verifies current password before updating

  // ── Delete ─────────────────────────────────────────────────────────
  deleteAccount(
    userId: string,
    dto:    DeleteAccountDto,
  ): Promise<void>;
  // user deletes own account — password confirmation required
  // soft delete — sets status = inactive, clears PII
}