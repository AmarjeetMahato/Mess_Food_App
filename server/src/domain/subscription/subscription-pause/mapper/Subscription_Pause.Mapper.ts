import { SubscriptionPauseRow } from "@/config/models";
import { SubscriptionPauseEntity } from "../entity/Subscription_Pause.Entity";
import { CreateSubscriptionPauseDto, SubscriptionPauseResponseDto } from "../dtos/Subscription_PauesDtos";

export class SubscriptionPauseMapper {

  // ─────────────────────────────────────────────
  // ✅ DB → Entity
  // ─────────────────────────────────────────────
  static toEntity(row: SubscriptionPauseRow): SubscriptionPauseEntity {
    return new SubscriptionPauseEntity(
      row.id,
      row.subscription_id,

      row.paused_by ?? null,

      new Date(row.pause_start),
      row.pause_end ? new Date(row.pause_end) : null,

      row.reason ?? null,

      row.is_resumed,
      row.resumed_at ? new Date(row.resumed_at) : null,

      row.days_paused ?? null,

      new Date(row.created_at)
    );
  }

  // ─────────────────────────────────────────────
  // ✅ DTO → Entity (Create)
  // ─────────────────────────────────────────────
  static toCreateEntity(
    dto: CreateSubscriptionPauseDto,
    userId: string
  ): SubscriptionPauseEntity {

    const now = new Date();

    return new SubscriptionPauseEntity(
      crypto.randomUUID(),               // ID (DB can override if needed)
      dto.subscriptionId,

      userId ?? dto.pausedBy ?? null,

      dto.pauseStart,
      dto.pauseEnd ?? null,

      dto.reason ?? null,

      false,                             // isResumed default
      null,                              // resumedAt
      null,                              // daysPaused

      now
    );
  }

  // ─────────────────────────────────────────────
  // ✅ Entity → Response DTO
  // ─────────────────────────────────────────────
  static toResponseDto(
    entity: SubscriptionPauseEntity
  ): SubscriptionPauseResponseDto {
    return {
      id: entity.id,
      subscriptionId: entity.subscriptionId,

      pausedBy: entity.pausedBy,

      pauseStart: entity.pauseStart,
      pauseEnd: entity.pauseEnd,

      reason: entity.reason,

      isResumed: entity.isResumed,
      resumedAt: entity.resumedAt,

      daysPaused: entity.daysPaused,

      createdAt: entity.createdAt,
    };
  }

  // ─────────────────────────────────────────────
  // ✅ Bulk: Rows → Entities
  // ─────────────────────────────────────────────
  static toEntityArray(
    rows: SubscriptionPauseRow[]
  ): SubscriptionPauseEntity[] {
    return rows.map(this.toEntity);
  }

  // ─────────────────────────────────────────────
  // ✅ Bulk: Entities → DTOs
  // ─────────────────────────────────────────────
  static toResponseDtoArray(
    entities: SubscriptionPauseEntity[]
  ): SubscriptionPauseResponseDto[] {
    return entities.map(this.toResponseDto);
  }
}