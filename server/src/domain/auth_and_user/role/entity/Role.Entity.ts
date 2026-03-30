// src/modules/auth_and_users/role.entity.ts

export class RoleEntity {
  constructor(
    public readonly id:          string,
    public readonly name:        string,
    public readonly description: string | null,
    public readonly isActive:    boolean,
    public readonly createdAt:   Date,
    public readonly updatedAt:   Date,
  ) {}

  // ── Business behaviour ─────────────────────────────────────────────

  isAdmin(): boolean {
    return this.name === 'admin';
  }

  isUser(): boolean {
    return this.name === 'user';
  }

  isDriver(): boolean {
    return this.name === 'driver';
  }

  isSeeded(): boolean {
    // Seeded roles cannot be deactivated or modified by admin
    return ['admin', 'user', 'driver'].includes(this.name);
  }

  canBeDeactivated(): boolean {
    // Seeded roles are protected — only custom roles can be deactivated
    return !this.isSeeded() && this.isActive;
  }

  canBeAssigned(): boolean {
    // Only active roles can be assigned to users
    return this.isActive;
  }
}