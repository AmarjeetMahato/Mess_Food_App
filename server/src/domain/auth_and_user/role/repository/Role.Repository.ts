import {type DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import {injectable, inject } from "tsyringe";
import { eq } from 'drizzle-orm';
import { IRoleRepository } from "./IRole.Repository";
import { RoleRow, Role } from "@/config/models";
import { CreateRoleDto, UpdateRoleDto } from "../dtos/RoleDtos";
import { InternalServerError } from "@/globalError/AppError";

 
@injectable()
export class RoleRepository implements IRoleRepository {
 
  constructor(
    @inject(TOKENS.DB) private readonly db: DbOrTx,
  ) {}
 
  // ── Find by ID ─────────────────────────────────────────────────────
  async findById(id: string): Promise<RoleRow | null> {
    const [row] = await this.db
      .select()
      .from(Role)
      .where(eq(Role.id, id))
      .limit(1);
 
    return row ?? null;
  }
 
  // ── Find by name ───────────────────────────────────────────────────
  // Used in AuthService to fetch default 'user' role during registration
  async findByName(name: string): Promise<RoleRow | null> {
    const [row] = await this.db
      .select()
      .from(Role)
      .where(eq(Role.name, name))
      .limit(1);
 
    return row ?? null;
  }
 
  // ── Find all roles ─────────────────────────────────────────────────
  // onlyActive = true  → admin dropdown (show only assignable roles)
  // onlyActive = false → admin panel  (show all including inactive)
  async findAll(onlyActive?: boolean): Promise<RoleRow[]> {
    if (onlyActive === true) {
      return this.db
        .select()
        .from(Role)
        .where(eq(Role.is_active, true));
    }
 
    return this.db
      .select()
      .from(Role);
  }
 
  // ── Create role ────────────────────────────────────────────────────
  async create(dto: CreateRoleDto): Promise<RoleRow> {
    const [row] = await this.db
      .insert(Role)
      .values({
        name:        dto.name,
        description: dto.description ?? null,
        is_active:   true,
      })
      .returning();

    if(!row){
        throw new InternalServerError("Failed to create Role")
    }  
    return row;
  }
 
  // ── Update role ────────────────────────────────────────────────────
  // name is intentionally excluded — role names are immutable
  // returns null if role not found — no separate findById round trip
  async update(id: string, dto: UpdateRoleDto): Promise<RoleRow | null> {
    const updateData: Partial<typeof Role.$inferInsert> = {};
 
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.is_active    !== undefined) updateData.is_active   = dto.is_active;
 
    // Always update updated_at
    updateData.updated_at = new Date();
 
    const [row] = await this.db
      .update(Role)
      .set(updateData)
      .where(eq(Role.id, id))
      .returning();
 
    return row ?? null;
  }
 
  // ── Activate role ──────────────────────────────────────────────────
  async activate(id: string): Promise<void> {
    await this.db
      .update(Role)
      .set({
        is_active:  true,
        updated_at: new Date(),
      })
      .where(eq(Role.id, id));
  }
 
  // ── Deactivate role ────────────────────────────────────────────────
  // Soft operation — never hard delete
  // Deactivated role users still exist but role cannot be newly assigned
  async deactivate(id: string): Promise<void> {
    await this.db
      .update(Role)
      .set({
        is_active:  false,
        updated_at: new Date(),
      })
      .where(eq(Role.id, id));
  }
}
