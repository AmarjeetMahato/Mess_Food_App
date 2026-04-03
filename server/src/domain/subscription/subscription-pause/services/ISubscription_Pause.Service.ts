import { CreateSubscriptionPauseDto, ResumeSubscriptionPauseDto, SubscriptionPauseQueryDto, SubscriptionPauseResponseDto, UpdateSubscriptionPauseDto } from "../dtos/Subscription_PauesDtos";

export interface ISubscriptionPauseService {

  // ─────────────────────────────────────────────
  // ✅ Create Pause
  // ─────────────────────────────────────────────
  pauseSubscription(data: CreateSubscriptionPauseDto,userId: string): Promise<SubscriptionPauseResponseDto>;

  // ─────────────────────────────────────────────
  // ✅ Resume Pause (CORE LOGIC)
  // ─────────────────────────────────────────────
  resumeSubscriptionPause(data: ResumeSubscriptionPauseDto,userId: string): Promise<SubscriptionPauseResponseDto>;

  // ─────────────────────────────────────────────
  // ✅ Get Pause by ID
  // ─────────────────────────────────────────────
  getPauseById(id: string): Promise<SubscriptionPauseResponseDto>;

  // ─────────────────────────────────────────────
  // ✅ Get Active Pause by Subscription
  // ─────────────────────────────────────────────
  getActivePauseBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseResponseDto | null>;

  // ─────────────────────────────────────────────
  // ✅ Get All Pauses for a Subscription
  // ─────────────────────────────────────────────
  getPausesBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseResponseDto[]>;

  // ─────────────────────────────────────────────
  // ✅ Get All Pauses by User
  // ─────────────────────────────────────────────
  getPausesByUserId(userId: string): Promise<SubscriptionPauseResponseDto[]>;

  // ─────────────────────────────────────────────
  // ✅ Update Pause (Admin / Edge cases)
  // ─────────────────────────────────────────────
  updatePause(
    id: string,
    data: UpdateSubscriptionPauseDto,
    userId: string
  ): Promise<SubscriptionPauseResponseDto>;

  // ─────────────────────────────────────────────
  // ✅ Filter / Query Pauses (Reporting)
  // ─────────────────────────────────────────────
  getPausesByFilters(filters: SubscriptionPauseQueryDto): Promise<SubscriptionPauseResponseDto[]>;
}