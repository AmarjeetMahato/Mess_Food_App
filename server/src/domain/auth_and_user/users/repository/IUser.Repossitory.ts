// src/shared/interfaces/IUserRepository.ts

import { UserRow, RoleRow } from "@/config/models";
import { ListUsersDto, UpdateProfileDto, UpdateUserStatusDto } from "../dtos/UsersDto";
import { UserEntity } from "../entity/User.Entity";


export interface IUserRepository {

  // ── Find ───────────────────────────────────────────────────────────
  findById(id: string):     Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByPhone(phone: string): Promise<UserEntity | null>;

  findAll(dto: ListUsersDto): Promise<{
    rows:  Array<{ user: UserRow; role: RoleRow }>;
    total: number;
  }>;
  // returns raw rows + total count for pagination
  // total fetched in same query — no separate COUNT call

  // ── Update ─────────────────────────────────────────────────────────
  updateProfile(userId: string,dto:UpdateProfileDto,): Promise<UserEntity>;
  // user updates their own name / avatar

  updateStatus(userId: string,dto:UpdateUserStatusDto): Promise<UserEntity>;
  // admin updates status — active / banned / inactive

  updatePassword(userId:string, newHashedPassword: string): Promise<void>;
  // service hashes password before calling this

  // ── Delete ─────────────────────────────────────────────────────────
  softDelete(userId: string): Promise<void>;
  // sets status = inactive + clears PII
  // hard delete only via admin panel with explicit confirmation
}