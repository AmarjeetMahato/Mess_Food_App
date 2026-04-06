import { MealSkipRow } from "@/config/models";
import { MealSkipEntity } from "../entity/meal_Skip.Entity";
import { MealSkipCreateSchemaDto, MealSkipResponseSchemaDto } from "../dtos/Meal_SkipDtos";


export class MealSkipMapper {
  constructor() {}

  // ----------------------
  // Map DB row → Entity
  // ----------------------
  static toEntity(row: MealSkipRow): MealSkipEntity {
    return new MealSkipEntity(
      row.id,
      row.user_id,
      row.subscription_id,
      row.daily_menu_id,
      row.slot,
      new Date(row.skip_date),
      row.reason ?? null,
      Number(row.wallet_credit_amount ?? 0),
      row.is_wallet_credited ?? false,
      row.created_at,
      row.updated_at
    );
  }

  // ----------------------
  // Map Create DTO → Entity
  // ----------------------
  static toCreateEntity(dto:MealSkipCreateSchemaDto): MealSkipEntity {
    return new MealSkipEntity(
      undefined,          // id will auto-generate
      dto.user_id,
      dto.subscription_id,
      dto.daily_menu_id,
      dto.slot,
      new Date(dto.skip_date),
      dto.reason ?? null,
      dto.wallet_credit_amount ?? 0,
      dto.is_wallet_credited ?? false,
      new Date(0),         // createdAt
      new Date(0)          // updatedAt
    );
  }

  // ----------------------
  // Map Entity → DB persistence object (row)
  // ----------------------
  static toPersistence(entity: MealSkipEntity): MealSkipRow{
    return {
      id: entity.id,
      user_id: entity.userId,
      subscription_id: entity.subscriptionId,
      daily_menu_id: entity.dailyMenuId,
      slot: entity.slot,
      skip_date: entity.skipDate, // YYYY-MM-DD
      reason: entity.reason,
      wallet_credit_amount: entity.walletCreditAmount.toFixed(2),
      is_wallet_credited: entity.isWalletCredited,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }

  // ----------------------
  // Map Entity → Response DTO
  // ----------------------
  static toResponse(entity: MealSkipEntity): MealSkipResponseSchemaDto{
    return {
      id: entity.id,
      user_id: entity.userId,
      subscription_id: entity.subscriptionId,
      daily_menu_id: entity.dailyMenuId,
      slot: entity.slot,
      skip_date: entity.skipDate.toISOString(),
      reason: entity.reason,
      wallet_credit_amount: entity.walletCreditAmount,
      is_wallet_credited: entity.isWalletCredited,
      created_at: entity.createdAt.toISOString(),
      updated_at:entity.updatedAt.toDateString()
    };
  }

    static toEntityArray(row:MealSkipRow[]): MealSkipEntity[]{
                 return row.map(this.toEntity)      
    }
  
     static toResponseDtoArray(row:MealSkipEntity[]): MealSkipResponseSchemaDto[]{
                 return row.map(this.toResponse)      
    }
}