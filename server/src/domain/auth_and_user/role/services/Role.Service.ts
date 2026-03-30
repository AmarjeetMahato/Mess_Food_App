// src/modules/auth_and_users/role.service.ts

import { NotFoundError, ConflictError, ForbiddenError } from '@/globalError/AppError';
import { TOKENS } from '@/helper/user_and_auth/token';
import { injectable, inject } from 'tsyringe';
import type { IAuthRepository } from '../../auth/repository/IAuth.Repository';
import { RoleResponseDto, RoleListResponseDto, CreateRoleDto, UpdateRoleDto, AssignRoleDto } from '../dtos/RoleDtos';
import { RoleMapper } from '../mapper/Role.Mapper';
import type { IRoleRepository } from '../repository/IRole.Repository';
import { IRoleService } from './IRole.Service';


@injectable()
export class RoleService implements IRoleService {

  constructor(
    @inject(TOKENS.RoleRepository) private readonly roleRepo: IRoleRepository,
    @inject(TOKENS.AuthRepository) private readonly authRepo: IAuthRepository,
    // AuthRepository used for assignRoleToUser — modifies users table
  ) {}

  // ── Get role by ID ─────────────────────────────────────────────────
  async getRoleById(id: string): Promise<RoleResponseDto> {
    const row = await this.roleRepo.findById(id);

    if (!row) {
      throw new NotFoundError('Role not found');
    }

    return RoleMapper.rowToResponseDto(row);
  }

  // ── Get role by name ───────────────────────────────────────────────
  async getRoleByName(name: string): Promise<RoleResponseDto> {
    const row = await this.roleRepo.findByName(name);

    if (!row) {
      throw new NotFoundError(`Role '${name}' not found`);
    }

    return RoleMapper.rowToResponseDto(row);
  }

  // ── Get all roles ──────────────────────────────────────────────────
  async getAllRoles(onlyActive?: boolean): Promise<RoleListResponseDto> {
    const rows = await this.roleRepo.findAll(onlyActive);
    return RoleMapper.toListResponseDto(rows);
  }

  // ── Create role ────────────────────────────────────────────────────
  async createRole(dto: CreateRoleDto): Promise<RoleResponseDto> {

    // Check name uniqueness — role_name_udx enforces at DB level
    // but we throw a clean error here before hitting the constraint
    const existing = await this.roleRepo.findByName(dto.name);
    if (existing) {
      throw new ConflictError(`Role '${dto.name}' already exists`);
    }

    const row = await this.roleRepo.create(dto);
    return RoleMapper.rowToResponseDto(row);
  }

  // ── Update role ────────────────────────────────────────────────────
  async updateRole(id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    const existing = await this.roleRepo.findById(id);

    if (!existing) {
      throw new NotFoundError('Role not found');
    }

    const entity = RoleMapper.toDomain(existing);

    // Seeded roles (admin, user, driver) are protected from updates
    if (entity.isSeeded()) {
      throw new ForbiddenError(
        `Seeded role '${entity.name}' cannot be modified`,
      );
    }

    const updated = await this.roleRepo.update(id, dto);

    if (!updated) {
      throw new NotFoundError('Role not found');
    }

    return RoleMapper.rowToResponseDto(updated);
  }

  // ── Activate role ──────────────────────────────────────────────────
  async activateRole(id: string): Promise<void> {
    const row = await this.roleRepo.findById(id);

    if (!row) {
      throw new NotFoundError('Role not found');
    }

    // No-op if already active
    if (row.is_active) return;

    await this.roleRepo.activate(id);
  }

  // ── Deactivate role ────────────────────────────────────────────────
  async deactivateRole(id: string): Promise<void> {
    const row = await this.roleRepo.findById(id);

    if (!row) {
      throw new NotFoundError('Role not found');
    }

    const entity = RoleMapper.toDomain(row);

    // Seeded roles cannot be deactivated — would break the entire app
    if (!entity.canBeDeactivated()) {
      throw new ForbiddenError(
        entity.isSeeded()
          ? `Seeded role '${entity.name}' cannot be deactivated`
          : `Role '${entity.name}' is already inactive`,
      );
    }

    await this.roleRepo.deactivate(id);
  }

  // ── Assign role to user ────────────────────────────────────────────
  async assignRoleToUser(dto: AssignRoleDto): Promise<void> {

    // Verify role exists and is active
    const role = await this.roleRepo.findById(dto.role_id);

    if (!role) {
      throw new NotFoundError('Role not found');
    }

    const roleEntity = RoleMapper.toDomain(role);

    if (!roleEntity.canBeAssigned()) {
      throw new ForbiddenError(
        `Role '${roleEntity.name}' is inactive and cannot be assigned`,
      );
    }

    // Verify user exists
    const user = await this.authRepo.findUserById(dto.user_id);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // No-op if user already has this role
    if (user.roleId === dto.role_id) return;

    // Update user's role_id — lives in users table, so uses authRepo
    await this.authRepo.updateUserRole(dto.user_id, dto.role_id);
  }
}