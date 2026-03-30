// src/modules/user/user.entity.ts

export class UserEntity {
  constructor(
    public readonly id:                string,
    public readonly name:              string,
    public readonly email:             string | null,
    public readonly phone:             string | null,
    public readonly passwordHash:      string | null,
    public readonly roleId:            string,
    public readonly roleName:          string,
    public readonly status:            'active' | 'inactive' | 'banned' | 'pending_verification',
    public readonly isEmailVerified:   boolean,
    public readonly isPhoneVerified:   boolean,
    public readonly avatarUrl:         string | null,
    public readonly lastLoginAt:       Date | null,
    public readonly createdAt:         Date,
    public readonly updatedAt:         Date,
  ) {}

  // ── Business behaviour ─────────────────────────────────────────────

  isActive():              boolean { return this.status === 'active'; }
  isBanned():              boolean { return this.status === 'banned'; }
  isInactive():            boolean { return this.status === 'inactive'; }
  isPendingVerification(): boolean { return this.status === 'pending_verification'; }
  isAdmin():               boolean { return this.roleName === 'admin'; }
  isDriver():              boolean { return this.roleName === 'driver'; }
  isUser():                boolean { return this.roleName === 'user'; }
  hasPassword():           boolean { return this.passwordHash !== null; }
  hasAvatar():             boolean { return this.avatarUrl !== null; }
  isFullyVerified():       boolean { return this.isEmailVerified && this.isPhoneVerified; }

  hasEmail(): boolean { return this.email !== null; }
  hasPhone(): boolean { return this.phone !== null; }

  canLogin(): boolean {
    return this.status === 'active';
  }

  daysSinceLastLogin(): number | null {
    if (!this.lastLoginAt) return null;
    const diffMs   = new Date().getTime() - this.lastLoginAt.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  isLongInactive(thresholdDays: number = 90): boolean {
    const days = this.daysSinceLastLogin();
    if (days === null) return false;
    return days > thresholdDays;
  }
}