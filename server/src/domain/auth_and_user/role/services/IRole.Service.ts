// src/shared/interfaces/IRoleService.ts

import { RoleResponseDto, RoleListResponseDto, CreateRoleDto, UpdateRoleDto, AssignRoleDto } from "../dtos/RoleDtos";


export interface IRoleService {

  // ── Read ───────────────────────────────────────────────────────────
  getRoleById(id: string):        Promise<RoleResponseDto>;
  getRoleByName(name: string):    Promise<RoleResponseDto>;
  getAllRoles(onlyActive?: boolean): Promise<RoleListResponseDto>;

  // ── Create ─────────────────────────────────────────────────────────
  createRole(dto: CreateRoleDto): Promise<RoleResponseDto>;

  // ── Update ─────────────────────────────────────────────────────────
  updateRole(id: string, dto: UpdateRoleDto): Promise<RoleResponseDto>;

  // ── Activate / Deactivate ──────────────────────────────────────────
  activateRole(id: string):   Promise<void>;
  deactivateRole(id: string): Promise<void>;

  // ── Assign ─────────────────────────────────────────────────────────
  assignRoleToUser(dto: AssignRoleDto): Promise<void>;
}