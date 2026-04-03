export class SubscriptionPauseEntity {
  constructor(
    public readonly id: string,
    public readonly subscriptionId: string,

    public pausedBy: string | null,

    public pauseStart: Date,
    public pauseEnd: Date | null,

    public reason: string | null,

    public isResumed: boolean,
    public resumedAt: Date | null,

    public daysPaused: string | null,

    public readonly createdAt: Date
  ) {}

  // ─────────────────────────────────────────────
  // ✅ Validate pause range
  // ─────────────────────────────────────────────
  validatePauseRange(): void {
    if (this.pauseEnd && this.pauseEnd < this.pauseStart) {
      throw new Error("pauseEnd must be greater than or equal to pauseStart");
    }
  }

  // ─────────────────────────────────────────────
  // ✅ Check if currently active pause
  // ─────────────────────────────────────────────
  isActivePause(): boolean {
    return !this.isResumed;
  }

  // ─────────────────────────────────────────────
  // ✅ Resume pause (CORE LOGIC)
  // ─────────────────────────────────────────────
  resume(): void {
    if (this.isResumed) {
      throw new Error("Pause is already resumed");
    }

    const now = new Date();

    this.isResumed = true;
    this.resumedAt = now;

    // if pauseEnd not set → set it to today
    if (!this.pauseEnd) {
      this.pauseEnd = now;
    }

    // calculate paused days
    const diffTime = this.pauseEnd.getTime() - this.pauseStart.getTime();

    if (diffTime < 0) {
      throw new Error("Invalid pause duration");
    }

    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    this.daysPaused = String(days);
  }

  // ─────────────────────────────────────────────
  // ✅ Extend pause manually (admin use)
  // ─────────────────────────────────────────────
  extendPause(newEndDate: Date): void {
    if (this.isResumed) {
      throw new Error("Cannot extend a resumed pause");
    }

    if (newEndDate < this.pauseStart) {
      throw new Error("New end date must be after pause start");
    }

    this.pauseEnd = newEndDate;
  }

  // ─────────────────────────────────────────────
  // ✅ Update reason
  // ─────────────────────────────────────────────
  updateReason(reason: string): void {
    if (!reason || reason.trim().length === 0) {
      throw new Error("Reason cannot be empty");
    }

    if (reason.length > 500) {
      throw new Error("Reason cannot exceed 500 characters");
    }

    this.reason = reason;
  }
}