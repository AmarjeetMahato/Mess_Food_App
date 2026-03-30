// src/modules/auth_and_users/auth.entity.ts
// Domain entity — pure business object
// No DB types, no HTTP types — only business behaviour

export class AuthUserEntity {
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
    public readonly createdAt:         Date,
    public readonly updatedAt:         Date,
  ) {}

  isActive():               boolean { return this.status === 'active'; }
  isBanned():               boolean { return this.status === 'banned'; }
  isPendingVerification():  boolean { return this.status === 'pending_verification'; }
  isAdmin():                boolean { return this.roleName === 'admin'; }
  isDriver():               boolean { return this.roleName === 'driver'; }
  canLogin():               boolean { return this.status === 'active'; }
  hasPassword():            boolean { return this.passwordHash !== null; }
  isRegisteredWithEmail():  boolean { return this.email !== null; }
  isRegisteredWithPhone():  boolean { return this.phone !== null; }
  needsEmailVerification(): boolean { return this.email !== null && !this.isEmailVerified; }
  needsPhoneVerification(): boolean { return this.phone !== null && !this.isPhoneVerified; }
}