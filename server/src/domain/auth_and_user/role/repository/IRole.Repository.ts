import { RoleRow } from "@/config/models";
import { CreateRoleDto, UpdateRoleDto } from "../dtos/RoleDtos";


export interface IRoleRepository {
 
  // ── Find ───────────────────────────────────────────────────────────
  findById(id: string):       Promise<RoleRow | null>;
  findByName(name: string):   Promise<RoleRow | null>;
  findAll(onlyActive?: boolean): Promise<RoleRow[]>;
  // onlyActive = true → WHERE is_active = true
  // onlyActive = false / undefined → return all roles
 
  // ── Create ─────────────────────────────────────────────────────────
  create(dto: CreateRoleDto): Promise<RoleRow>;
 
  // ── Update ─────────────────────────────────────────────────────────
  update(id: string, dto: UpdateRoleDto): Promise<RoleRow | null>;
  // returns null if role not found
 
  // ── Activate / Deactivate ──────────────────────────────────────────
  activate(id: string):   Promise<void>;
  deactivate(id: string): Promise<void>;
  // soft operations — never hard delete a role
  // deleting a role would orphan all users assigned to it
}