import {type DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import { injectable, inject } from "tsyringe";
import { IAuthRepository } from "./IAuth.Repository";
import { UserInsert, RoleRow, User, Role } from "@/config/models";
import { AuthUserEntity } from "../entity/Auth.Entity";
import { eq } from "drizzle-orm";
import { AuthMapper } from "../mapper/Auth.Mapper";

@injectable()
export class AuthRepository implements IAuthRepository {
      
      constructor(@inject(TOKENS.DB) private db:DbOrTx){}

  async updateUserRole(userId: string, roleId: string): Promise<void> {
       await this.db.update(User)           // users table — correct repository
                   .set({
                         role_id:    roleId,   // new role assigned
                         updated_at: new Date(), // audit trail
                })
                       .where(eq(User.id, userId));
           }

        // ── Private helper — join user + role → entity ─────────────────────
  private async findUserWith(field: 'email' | 'phone' | 'id',value: string,): Promise<AuthUserEntity | null> {
    const condition =
      field === 'email' ? eq(User.email, value)
      : field === 'phone' ? eq(User.phone, value)
      : eq(User.id, value);
 
    const [result] = await this.db
      .select({ user: User, role: Role })
      .from(User)
      .innerJoin(Role, eq(User.role_id, Role.id))
      .where(condition)
      .limit(1);
 
    if (!result) return null;
    return AuthMapper.toDomain(result.user, result.role);
  }
 
  // ── User ───────────────────────────────────────────────────────────
  async findUserByEmail(email: string): Promise<AuthUserEntity | null> {
    return this.findUserWith('email', email);
  }
 
  async findUserByPhone(phone: string): Promise<AuthUserEntity | null> {
    return this.findUserWith('phone', phone);
  }
 
  async findUserById(id: string): Promise<AuthUserEntity | null> {
    return this.findUserWith('id', id);
  }
 
  async createUser(data: UserInsert): Promise<AuthUserEntity> {
    const [user] = await this.db
      .insert(User)
      .values(data)
      .returning();

       if (!user) {
    throw new Error("User creation failed");
  }

    const [role] = await this.db
      .select()
      .from(Role)
      .where(eq(Role.id, user.role_id))
      .limit(1);

        if (!role) {
    throw new Error("Role not found");
  }

 
    return AuthMapper.toDomain(user, role);
  }
 
  async updateLastLogin(userId: string): Promise<void> {
    await this.db
      .update(User)
      .set({ last_login_at: new Date(), updated_at: new Date() })
      .where(eq(User.id, userId));
  }
 
  async markEmailVerified(userId: string): Promise<void> {
    await this.db
      .update(User)
      .set({ is_email_verified: true, status: 'active', updated_at: new Date() })
      .where(eq(User.id, userId));
  }
 
  async markPhoneVerified(userId: string): Promise<void> {
    await this.db
      .update(User)
      .set({ is_phone_verified: true, status: 'active', updated_at: new Date() })
      .where(eq(User.id, userId));
  }
 
  // ── Role ───────────────────────────────────────────────────────────
  async findDefaultRole(): Promise<RoleRow | null> {
    const [role] = await this.db
      .select()
      .from(Role)
      .where(eq(Role.name, 'user'))
      .limit(1);
    return role ?? null;
  }
 
  async findRoleByName(name: string): Promise<RoleRow | null> {
    const [role] = await this.db
      .select()
      .from(Role)
      .where(eq(Role.name, name))
      .limit(1);
    return role ?? null;
  }

    
}