export type PlanType = "daily" | "weekly" | "monthly";
export type SubscriptionStatus = "active" | "paused" | "expired" | "cancelled";

export class SubscriptionEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,

    public planType: PlanType,
    public status: SubscriptionStatus,

    public startDate: Date,
    public endDate: Date,

    public totalDays: number,
    public consumedDays: number,
    public remainingDays: number,

    public hasBreakfast: boolean,
    public hasLunch: boolean,
    public hasDinner: boolean,
    public hasSnacks: boolean,

    public autoRenew: boolean,

    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // ─────────────────────────────────────────────
  // 🔥 BUSINESS METHODS
  // ─────────────────────────────────────────────

  // ✅ Check if subscription is active
  isActive(): boolean {
    return this.status === "active";
  }

  // ✅ Check expiry
  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  // ✅ Check if slot is allowed
  isSlotAllowed(slot: PlanType | string): boolean {
    switch (slot) {
      case "breakfast":
        return this.hasBreakfast;
      case "lunch":
        return this.hasLunch;
      case "dinner":
        return this.hasDinner;
      case "snacks":
        return this.hasSnacks;
      default:
        return false;
    }
  }

  // 🔥 CORE LOGIC (VERY IMPORTANT)
  consumeMeal(): void {
    if (!this.isActive()) {
      throw new Error("Subscription is not active");
    }

    if (this.isExpired()) {
      this.status = "expired";
      throw new Error("Subscription has expired");
    }

    if (this.remainingDays <= 0) {
      throw new Error("No remaining days left");
    }

    this.consumedDays += 1;
    this.remainingDays -= 1;
    this.updatedAt = new Date();
  }

  // ✅ Pause subscription
  pause(): void {
    if (this.status !== "active") {
      throw new Error("Only active subscriptions can be paused");
    }

    this.status = "paused";
    this.updatedAt = new Date();
  }

  // ✅ Resume subscription
  resume(): void {
    if (this.status !== "paused") {
      throw new Error("Only paused subscriptions can be resumed");
    }

    this.status = "active";
    this.updatedAt = new Date();
  }

  // ✅ Cancel subscription
  cancel(): void {
    this.status = "cancelled";
    this.updatedAt = new Date();
  }
}