import { SubscriptionPauseRow } from "@/config/models";
import { SubscriptionPauseEntity } from "../entity/Subscription_Pause.Entity";

export interface ISubscriptionPauseRepository {

  // ─────────────────────────────────────────────
  // ✅ Create pause
  // ─────────────────────────────────────────────
  createPause(data: SubscriptionPauseEntity): Promise<SubscriptionPauseRow>;

  // ─────────────────────────────────────────────
  // ✅ Resume pause (update is_resumed, resumed_at, etc.)
  // ─────────────────────────────────────────────
  resumePause(id: string,data: Partial<SubscriptionPauseEntity>): Promise<SubscriptionPauseRow>;

  // ─────────────────────────────────────────────
  // ✅ Get pause by ID
  // ─────────────────────────────────────────────
  getById(id: string): Promise<SubscriptionPauseRow | null>;

  // ─────────────────────────────────────────────
  // ✅ Get all pauses for a subscription
  // ─────────────────────────────────────────────
  getBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseRow[]>;

  // ─────────────────────────────────────────────
  // ✅ Get active pause (VERY IMPORTANT)
  // subscription_id + is_resumed = false
  // ─────────────────────────────────────────────
  getActivePauseBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseRow | null>;

  // ─────────────────────────────────────────────
  // ✅ Update pause (admin / edge cases)
  // ─────────────────────────────────────────────
  updatePause(id: string,data: Partial<SubscriptionPauseEntity>): Promise<SubscriptionPauseRow>;

  // ─────────────────────────────────────────────
  // ✅ Get pauses by user (optional)
  // ─────────────────────────────────────────────
  getByUserId(userId: string): Promise<SubscriptionPauseRow[]>;

  // ─────────────────────────────────────────────
  // ✅ Query with filters (reporting)
  // ─────────────────────────────────────────────
  getByFilters(
    filters: {
      subscriptionId?: string;
      isResumed?: boolean;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<SubscriptionPauseRow[]>;
}