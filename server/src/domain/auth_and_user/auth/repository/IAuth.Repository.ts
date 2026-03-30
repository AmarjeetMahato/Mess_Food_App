import { RoleRow, UserInsert } from "@/config/models";
import { AuthUserEntity } from "../entity/Auth.Entity";


export interface IAuthRepository {
  // ── User ──────────────────────────────────────────────────────────────
  findUserByEmail(email: string):  Promise<AuthUserEntity | null>;
  findUserByPhone(phone: string):  Promise<AuthUserEntity | null>;
  findUserById(id: string):        Promise<AuthUserEntity | null>;
  createUser(data: UserInsert):    Promise<AuthUserEntity>;
  updateLastLogin(userId: string): Promise<void>;
  markEmailVerified(userId: string): Promise<void>;
  markPhoneVerified(userId: string): Promise<void>;
  updateUserRole(userId: string, roleId: string): Promise<void>;
  // ── Role ──────────────────────────────────────────────────────────────
  findDefaultRole():             Promise<RoleRow | null>;
  findRoleByName(name: string):  Promise<RoleRow | null>;
}