import { injectable, inject } from "tsyringe";
import { IUserRepository } from "./IUser.Repossitory";
import { Role, RoleRow, User, UserRow } from "@/config/models";
import { TOKENS } from "@/helper/user_and_auth/token";
import type { DbOrTx } from "@/config/database/database";
import { and, eq, sql } from "drizzle-orm";
import { ListUsersDto, UpdateProfileDto, UpdateUserStatusDto } from "../dtos/UsersDto";
import { UserEntity } from "../entity/User.Entity";
import { UserMapper } from "../mapper/User.Mapper";
import { InternalServerError } from "@/globalError/AppError";


// src/modules/user/user.repository.ts


@injectable()
export class UserRepository implements IUserRepository {

  constructor(
    @inject(TOKENS.DB) private readonly db: DbOrTx,
  ) {}

  // ── Private helper — join user + role → entity ─────────────────────
  private async findUserWith(field: 'id' | 'email' | 'phone',value: string,): Promise<UserEntity | null> {
    const condition =
      field === 'id'    ? eq(User.id,    value)
      : field === 'email' ? eq(User.email, value)
      : eq(User.phone, value);

    const [result] = await this.db
      .select({ user: User, role: Role })
      .from(User)
      .innerJoin(Role, eq(User.role_id, Role.id))
      .where(condition)
      .limit(1);

    if (!result) return null;
    return UserMapper.toDomain(result.user, result.role);
  }

  // ── Find ───────────────────────────────────────────────────────────
  async findById(id: string):       Promise<UserEntity | null> {
    return this.findUserWith('id', id);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.findUserWith('email', email);
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    return this.findUserWith('phone', phone);
  }

  // ── Find all (paginated + filtered) ───────────────────────────────
  async findAll(dto: ListUsersDto): Promise<{
    rows:  Array<{ user: UserRow; role: RoleRow }>;
    total: number;
  }> {
    const offset = (dto.page - 1) * dto.limit;

    // Build dynamic where conditions
    const conditions = [];

    if (dto.status) {
      conditions.push(eq(User.status, dto.status));
    }

    if (dto.role_id) {
      conditions.push(eq(User.role_id, dto.role_id));
    }

    if (dto.search) {
      // Search across name, email, phone
      conditions.push(
        sql`(
          ${User.name}  ILIKE ${'%' + dto.search + '%'} OR
          ${User.email} ILIKE ${'%' + dto.search + '%'} OR
          ${User.phone} ILIKE ${'%' + dto.search + '%'}
        )`,
      );
    }

    const whereClause = conditions.length > 0
      ? and(...conditions)
      : undefined;

    // Fetch page
    const rows = await this.db
      .select({ user: User, role: Role })
      .from(User)
      .innerJoin(Role, eq(User.role_id, Role.id))
      .where(whereClause)
      .limit(dto.limit)
      .offset(offset);

    // Fetch total count — same filters, no pagination
    const [countResult] = await this.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(User)
      .where(whereClause);

    return {
      rows,
      total: countResult?.count ?? 0,
    };
  }

  // ── Update profile ─────────────────────────────────────────────────
  async updateProfile(
    userId: string,
    dto:    UpdateProfileDto,
  ): Promise<UserEntity> {
    const updateData: Partial<typeof User.$inferInsert> = {
      updated_at: new Date(),
    };

    if (dto.name       !== undefined) updateData.name       = dto.name;
    if (dto.avatar_url !== undefined) updateData.avatar_url = dto.avatar_url;

    const [user] = await this.db
      .update(User)
      .set(updateData)
      .where(eq(User.id, userId))
      .returning();

    if(!user){
        throw new InternalServerError("Failed to update user");  
    }  

    const [role] = await this.db
      .select()
      .from(Role)
      .where(eq(Role.id, user.role_id))
      .limit(1);

    if(!role){
        throw new InternalServerError("Failed to fetch user");
    }  

    return UserMapper.toDomain(user, role);
  }

  // ── Update status ──────────────────────────────────────────────────
  async updateStatus(userId: string,dto:UpdateUserStatusDto): Promise<UserEntity> {
    const [user] = await this.db
      .update(User)
      .set({
        status:     dto.status,
        updated_at: new Date(),
      })
      .where(eq(User.id, userId))
      .returning();
    
     if(!user){
        throw new InternalServerError("Failed to update user");  
    } 

    const [role] = await this.db
      .select()
      .from(Role)
      .where(eq(Role.id, user.role_id))
      .limit(1);

       if(!role){
        throw new InternalServerError("Failed to fetch user");
    }  
  

    return UserMapper.toDomain(user, role);
  }

  // ── Update password ────────────────────────────────────────────────
  async updatePassword(userId: string,newHashedPassword: string): Promise<void> {
    await this.db
      .update(User)
      .set({
        password_hash: newHashedPassword,
        updated_at:    new Date(),
      })
      .where(eq(User.id, userId));
  }

  // ── Soft delete ────────────────────────────────────────────────────
  // Sets status = inactive + clears PII
  // Keeps the row for audit — hard delete via admin only
  async softDelete(userId: string): Promise<void> {
    await this.db
      .update(User)
      .set({
        status:            'inactive',
        email:             null,       // clear PII
        phone:             null,       // clear PII
        password_hash:     null,       // revoke login
        avatar_url:        null,
        updated_at:        new Date(),
      })
      .where(eq(User.id, userId));
  }
}