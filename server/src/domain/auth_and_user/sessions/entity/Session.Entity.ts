
export class SessionEntity{
    constructor(
    public readonly id:                string,
    public readonly userId:            string,
    public readonly deviceId:          string | null,
    public readonly refreshTokenHash:  string,
    public readonly accessTokenJti:    string,
    public readonly ipAddress:         string | null,
    public readonly userAgent:         string | null,
    public readonly isActive:          boolean,
    public readonly expiresAt:         Date,
    public readonly lastUsedAt:        Date,
    public readonly createdAt:         Date,
  ) {}

    // ── Business behaviour ─────────────────────────────────────────────
 
    isExpired():boolean{
      return new Date() > this.expiresAt
    }

    isValid():boolean{
          // Session is valid only if active and not expired
      return  this.isActive && !this.isExpired()
    }

      isCurrent(jti: string): boolean {
    // true = this session belongs to the current request's access token
    return this.accessTokenJti === jti;
  }
 
  hasDevice(): boolean {
    return this.deviceId !== null;
  }

    daysUntilExpiry(): number {
    const diffMs   = this.expiresAt.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
 
  isAboutToExpire(thresholdDays: number = 3): boolean {
    // Used to trigger "session expiring soon" notification
    return this.daysUntilExpiry() <= thresholdDays;
  }
 
  wasRecentlyUsed(thresholdMinutes: number = 5): boolean {
    // true = session was used within the last N minutes
    // used to skip unnecessary last_used_at DB updates
    const diffMs  = new Date().getTime() - this.lastUsedAt.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    return diffMin < thresholdMinutes;
  }
}