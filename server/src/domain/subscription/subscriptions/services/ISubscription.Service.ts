import { CreateSubscriptionDto, SubscriptionResponseDto, UpdateSubscriptionDto } from "../dtos/subscriptionDtos";

export interface ISubscriptionService {

  // ─────────────────────────────────────────────
  // ✅ Create Subscription
  // ─────────────────────────────────────────────
createSubscription(data: CreateSubscriptionDto): Promise<SubscriptionResponseDto>;

  // ─────────────────────────────────────────────
  // ✅ Update Subscription
  // ─────────────────────────────────────────────
  updateSubscription(id: string,data: UpdateSubscriptionDto,userId:string): Promise<SubscriptionResponseDto>;

  // ─────────────────────────────────────────────
  // ✅ Get by ID
  // ─────────────────────────────────────────────
  getSubscriptionById(id: string): Promise<SubscriptionResponseDto>;

  // ─────────────────────────────────────────────
  // 🔥 Get Active Subscription (VERY IMPORTANT)
  // ─────────────────────────────────────────────
  getActiveSubscriptionByUserId(userId: string): Promise<SubscriptionResponseDto | null>;

  // ─────────────────────────────────────────────
  // 🔥 Get All Subscriptions of User
  // ─────────────────────────────────────────────
  getSubscriptionsByUserId(userId: string): Promise<SubscriptionResponseDto[]>;

  // ─────────────────────────────────────────────
  // 🔥 Pause Subscription
  // ─────────────────────────────────────────────
  pauseSubscription(id: string): Promise<SubscriptionResponseDto>;

  // ─────────────────────────────────────────────
  // 🔥 Resume Subscription
  // ─────────────────────────────────────────────
  resumeSubscription(id: string): Promise<SubscriptionResponseDto>;

  // ─────────────────────────────────────────────
  // 🔥 Cancel Subscription
  // ─────────────────────────────────────────────
  cancelSubscription(id: string): Promise<SubscriptionResponseDto>;
}