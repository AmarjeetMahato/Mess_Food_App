// src/modules/user/user.service.ts

import { NotFoundError, ForbiddenError, UnauthorizedError } from "@/globalError/AppError";
import { TOKENS } from "@/helper/user_and_auth/token";
import bcrypt from "node_modules/bcryptjs/umd/types";
import { injectable, inject } from "tsyringe";
import { UserResponseDto, ListUsersDto, UserListResponseDto, UpdateProfileDto, UpdateUserStatusDto, ChangePasswordDto, DeleteAccountDto } from "../dtos/UsersDto";
import { UserMapper } from "../mapper/User.Mapper";
import type { IUserRepository } from "../repository/IUser.Repossitory";
import { IUserService } from "./IUser.Service";


const BCRYPT_ROUNDS = 12;

@injectable()
export class UserService implements IUserService {

  constructor(
    @inject(TOKENS.UserRepository) private readonly repo: IUserRepository,
  ) {}

  // ── Get user by ID ─────────────────────────────────────────────────
  async getUserById(id: string): Promise<UserResponseDto> {
    const user = await this.repo.findById(id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return UserMapper.toResponseDto(user);
  }

  // ── Get own profile ────────────────────────────────────────────────
  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.getUserById(userId);
  }

  // ── Get all users (admin) ──────────────────────────────────────────
  async getAllUsers(dto: ListUsersDto): Promise<UserListResponseDto> {
    const { rows, total } = await this.repo.findAll(dto);

    return UserMapper.toListResponseDto(
      rows,
      total,
      dto.page,
      dto.limit,
    );
  }

  // ── Update own profile ─────────────────────────────────────────────
  async updateProfile(userId: string,dto:    UpdateProfileDto): Promise<UserResponseDto> {
    const existing = await this.repo.findById(userId);

    if (!existing) {
      throw new NotFoundError('User not found');
    }

    const updated = await this.repo.updateProfile(userId, dto);
    return UserMapper.toResponseDto(updated);
  }

  // ── Update user status (admin only) ───────────────────────────────
  async updateUserStatus(targetUserId: string,dto:UpdateUserStatusDto,adminId:string): Promise<UserResponseDto> {

    // Admin cannot change their own status
    if (targetUserId === adminId) {
      throw new ForbiddenError('You cannot change your own status');
    }

    const target = await this.repo.findById(targetUserId);

    if (!target) {
      throw new NotFoundError('User not found');
    }

    // Cannot ban another admin
    if (target.isAdmin() && dto.status === 'banned') {
      throw new ForbiddenError('Admin accounts cannot be banned');
    }

    const updated = await this.repo.updateStatus(targetUserId, dto);
    return UserMapper.toResponseDto(updated);
  }

  // ── Change password ────────────────────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // User must have a password to change it
    if (!user.hasPassword()) {
      throw new ForbiddenError(
        'No password set on this account. Use OAuth login or set a password first.',
      );
    }

    // Verify current password
    const isMatch = await bcrypt.compare(
      dto.current_password,
      user.passwordHash!,
    );

    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const newHash = await bcrypt.hash(dto.new_password, BCRYPT_ROUNDS);

    await this.repo.updatePassword(userId, newHash);
  }

  // ── Delete own account ─────────────────────────────────────────────
  async deleteAccount( userId: string,dto: DeleteAccountDto): Promise<void> {
    const user = await this.repo.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Admin accounts cannot be self-deleted
    if (user.isAdmin()) {
      throw new ForbiddenError(
        'Admin accounts cannot be deleted. Contact a super admin.',
      );
    }

    // Verify password before deletion
    if (user.hasPassword()) {
      const isMatch = await bcrypt.compare(
        dto.password,
        user.passwordHash!,
      );

      if (!isMatch) {
        throw new UnauthorizedError('Incorrect password. Account deletion cancelled.');
      }
    }

    await this.repo.softDelete(userId);
  }
}