import { SubscriptionRow } from "@/config/models";
import { SubscriptionEntity } from "../entity/SubscriptionEntity";
import { subscriptionStatusEnumSchemaDto } from "../dtos/subscriptionDtos";


export interface ISubscriptionRepository {

  // ─────────────────────────────────────────────
  // ✅ Create
  // ─────────────────────────────────────────────
  createSubscription(entity: SubscriptionEntity): Promise<SubscriptionRow>;

  // ─────────────────────────────────────────────
  // ✅ Update (generic)
  // ─────────────────────────────────────────────
  updateSubscription(id: string,entity:SubscriptionEntity): Promise<SubscriptionRow>;

  // ─────────────────────────────────────────────
  // ✅ Get by ID
  // ─────────────────────────────────────────────
  getById(id: string): Promise<SubscriptionRow | null>;

  // ─────────────────────────────────────────────
  // 🔥 Get Active Subscription by User (VERY IMPORTANT)
  // ─────────────────────────────────────────────
  getActiveByUserId(userId: string): Promise<SubscriptionRow | null>;

  // ─────────────────────────────────────────────
  // 🔥 Get All Subscriptions of User
  // ─────────────────────────────────────────────
  getByUserId(userId: string): Promise<SubscriptionRow[]>;

  // ─────────────────────────────────────────────
  // 🔥 Consumption Update (CORE LOGIC SUPPORT)
  // ─────────────────────────────────────────────
  updateConsumption(id: string,consumedDays: number,remainingDays: number): Promise<SubscriptionRow>;

  // ─────────────────────────────────────────────
  // 🔥 Status Update
  // ─────────────────────────────────────────────
  updateStatus(id: string,status: subscriptionStatusEnumSchemaDto): Promise<SubscriptionRow>;

  // ─────────────────────────────────────────────
  // 🔥 Expiry Handling
  // ─────────────────────────────────────────────
  getExpiredSubscriptions(currentDate: Date): Promise<SubscriptionRow[]>;

  // ─────────────────────────────────────────────
  // 🔥 Auto Renew Support
  // ─────────────────────────────────────────────
  getAutoRenewSubscriptions(): Promise<SubscriptionRow[]>;

  pauseSubscription(id: string): Promise<SubscriptionRow>;

  resumeSubscription(id:string): Promise<SubscriptionRow>;

}