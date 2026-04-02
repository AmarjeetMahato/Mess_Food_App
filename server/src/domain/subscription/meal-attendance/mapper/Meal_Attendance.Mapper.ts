import { MealAttendanceRow } from "@/config/models";
import { MealAttendanceEntity} from "../entity/meal-attendance-entity";
import  type {createMealAttendanceSchemaDto, mealAttendanceResponseSchemaDto} from "../dtos/Meal_AttendanceDtos"


export class MealAttendanceMapper {
  
  // ─────────────────────────────────────────────
  // ✅ Row → Entity
  // ─────────────────────────────────────────────
  static toEntity(row: MealAttendanceRow): MealAttendanceEntity {
    return new MealAttendanceEntity(
      row.id,
      row.user_id,
      row.subscription_id,
      row.daily_menu_id,
      row.slot,
      new Date(row.attendance_date),
      row.is_consumed,
      row.scanned_at ? new Date(row.scanned_at) : null,
      row.scanned_by ?? null,
      row.created_by ?? null,
      row.updated_by ?? null,
      new Date(row.created_at),
      new Date(row.updated_at)
    );
  }

  // ─────────────────────────────────────────────
  // ✅ Entity → Response DTO
  // ─────────────────────────────────────────────
  static toResponseDto(entity: MealAttendanceEntity): mealAttendanceResponseSchemaDto {
    return {
      id: entity.id,

      userId: entity.userId,
      subscriptionId: entity.subscriptionId,
      dailyMenuId: entity.dailyMenuId,

      slot: entity.slot,
      attendanceDate: entity.attendanceDate,

      isConsumed: entity.isConsumed,
      scannedAt: entity.scannedAt,
      scannedBy: entity.scannedBy,

      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  // ─────────────────────────────────────────────
  // ✅ Create DTO → Entity
  // ─────────────────────────────────────────────
  static toCreateEntity(dto: createMealAttendanceSchemaDto): MealAttendanceEntity {
    const now = new Date();

    return new MealAttendanceEntity(
      crypto.randomUUID(), // generate ID
      dto.userId,
      dto.subscriptionId,
      dto.dailyMenuId,
      dto.slot,
      dto.attendanceDate,
      dto.isConsumed ?? false,
      dto.scannedAt ?? null,
      dto.scannedBy ?? null,
      dto.createdBy,
      dto.createdBy, // initially same
      now,
      now
    );
  }

  // ─────────────────────────────────────────────
  // ✅ Entity → DB Insert Object (optional but useful)
  // ─────────────────────────────────────────────
  static toPersistence(entity: MealAttendanceEntity) {
    return {
      id: entity.id,
      user_id: entity.userId,
      subscription_id: entity.subscriptionId,
      daily_menu_id: entity.dailyMenuId,
      slot: entity.slot,
      attendance_date: entity.attendanceDate,
      is_consumed: entity.isConsumed,
      scanned_at: entity.scannedAt,
      scanned_by: entity.scannedBy,
      created_by: entity.createdBy,
      updated_by: entity.updatedBy,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}