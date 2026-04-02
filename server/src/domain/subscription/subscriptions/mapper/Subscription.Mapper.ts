import { SubscriptionRow } from "@/config/models";
import { SubscriptionResponseDto, CreateSubscriptionDto } from "../dtos/subscriptionDtos";
import { SubscriptionEntity } from "../entity/SubscriptionEntity";


export class SubscriptionMapper {

  // ─────────────────────────────────────────────
  // ✅ Row → Entity
  // ─────────────────────────────────────────────
  static toEntity(row: SubscriptionRow): SubscriptionEntity {
    return new SubscriptionEntity(
      row.id,
      row.user_id,

      row.plan_type,
      row.status,

      new Date(row.start_date),
      new Date(row.end_date),

      row.total_days,
      row.consumed_days,
      row.remaining_days,

      row.has_breakfast,
      row.has_lunch,
      row.has_dinner,
      row.has_snacks,

      row.auto_renew,

      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

    // ✅ map array of rows to entities
  static toEntityArray(rows: SubscriptionRow[]): SubscriptionEntity[] {
    return rows.map(this.toEntity);
  }

  // ─────────────────────────────────────────────
  // ✅ Entity → Response DTO
  // ─────────────────────────────────────────────
  static toResponseDto(entity: SubscriptionEntity): SubscriptionResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,

      planType: entity.planType,
      status: entity.status,

      startDate: entity.startDate,
      endDate: entity.endDate,

      totalDays: entity.totalDays,
      consumedDays: entity.consumedDays,
      remainingDays: entity.remainingDays,

      hasBreakfast: entity.hasBreakfast,
      hasLunch: entity.hasLunch,
      hasDinner: entity.hasDinner,
      hasSnacks: entity.hasSnacks,

      autoRenew: entity.autoRenew,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

    // ✅ map array of entities to array of response DTOs
  static toResponseDtoArray(entities: SubscriptionEntity[]): SubscriptionResponseDto[] {
    return entities.map(this.toResponseDto);
  }

  // ─────────────────────────────────────────────
  // ✅ Create DTO → Entity
  // ─────────────────────────────────────────────
 static toCreateEntity(dto: CreateSubscriptionDto): SubscriptionEntity {
  return new SubscriptionEntity(
    "", // ✅ DB will generate

    dto.userId,

    dto.planType,
    dto.status ?? "active",

    dto.startDate,
    dto.endDate,

    dto.totalDays,
    dto.consumedDays ?? 0,
    dto.remainingDays,

    dto.hasBreakfast,
    dto.hasLunch,
    dto.hasDinner,
    dto.hasSnacks,

    dto.autoRenew ?? false,

    new Date(0), // DB handles
    new Date(0)
  );
}
  // ─────────────────────────────────────────────
  // ✅ Entity → Persistence (DB Insert/Update)
  // ─────────────────────────────────────────────
  static toPersistence(entity: SubscriptionEntity) {
    return {
      id: entity.id,
      user_id: entity.userId,

      plan_type: entity.planType,
      status: entity.status,

      start_date: entity.startDate,
      end_date: entity.endDate,

      total_days: entity.totalDays,
      consumed_days: entity.consumedDays,
      remaining_days: entity.remainingDays,

      has_breakfast: entity.hasBreakfast,
      has_lunch: entity.hasLunch,
      has_dinner: entity.hasDinner,
      has_snacks: entity.hasSnacks,

      auto_renew: entity.autoRenew,

      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  // ─────────────────────────────────────────────
  // 🔥 Update Helper (VERY IMPORTANT)
  // ─────────────────────────────────────────────
  static applyConsumption(entity: SubscriptionEntity): SubscriptionEntity {
    entity.consumeMeal(); // 🔥 domain logic
    return entity;
  }
}