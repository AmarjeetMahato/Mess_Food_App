import { NotificationRow } from "@/config/models";
import { NotificationEntity } from "../entity/notificationeEntity";
import { CreateNotificationInput, NotificationResponse, UpdateNotificationInput } from "../dtos/NotificationDtos";

export class NotificationMapper {

  // ─────────────────────────────────────────────
  // ✅ Row → Entity
  // ─────────────────────────────────────────────
  static toEntity(row: NotificationRow): NotificationEntity {
    return new NotificationEntity(
      row.id,
      row.user_id,
      row.title,
      row.body,
      row.type,
      row.channel,
      row.status,
      row.is_read,
      row.created_at,
      row.reference_id ?? null,
      row.reference_type ?? null,
      row.read_at,
      row.sent_at,
      row.failed_reason ?? null,
    );
  }

  // ─────────────────────────────────────────────
  // ✅ Entity → Response DTO
  // ─────────────────────────────────────────────
  static toResponseDto(entity: NotificationEntity): NotificationResponse {
    return {
      id: entity.id,
      user_id: entity.user_id,
      title: entity.title,
      body: entity.body,
      type: entity.type,
      channel: entity.channel,
      status: entity.status,
      is_read: entity.is_read,
      reference_id: entity.reference_id!,
      reference_type: entity.reference_type!,
      read_at: entity.read_at!,
      sent_at: entity.sent_at!,
      failed_reason: entity.failed_reason!,
      created_at: entity.created_at,
    };
  }

  // ─────────────────────────────────────────────
  // ✅ Create DTO → Entity
  // ─────────────────────────────────────────────
  static toCreateEntity(dto: CreateNotificationInput): NotificationEntity {
    const now = new Date();
    return new NotificationEntity(
      dto.id!, // generate ID if not provided
      dto.user_id,
      dto.title,
      dto.body,
      dto.type,
      dto.channel,
      'pending', // default status
      false,     // default is_read
      dto.created_at!,
      dto.reference_id ?? null,
      dto.reference_type ?? null,
      null, // read_at
      null, // sent_at
      null, // failed_reason
    );
  }

  // ─────────────────────────────────────────────
  // ✅ Update DTO → Entity (partial update)
  // ─────────────────────────────────────────────
  static toUpdateEntity(entity: NotificationEntity, dto: UpdateNotificationInput): NotificationEntity {
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.body !== undefined) entity.body = dto.body;
    if (dto.type !== undefined) entity.type = dto.type;
    if (dto.channel !== undefined) entity.channel = dto.channel;
    if (dto.status !== undefined) entity.status = dto.status;
    if (dto.reference_id !== undefined) entity.reference_id = dto.reference_id;
    if (dto.reference_type !== undefined) entity.reference_type = dto.reference_type;
    if (dto.is_read !== undefined) entity.is_read = dto.is_read;
    if (dto.read_at !== undefined) entity.read_at = dto.read_at ?? null;
    if (dto.sent_at !== undefined) entity.sent_at = dto.sent_at ?? null;
    if (dto.failed_reason !== undefined) entity.failed_reason = dto.failed_reason ?? null;

    return entity;
  }

  // ─────────────────────────────────────────────
  // ✅ Entity → DB Persistence Object
  // ─────────────────────────────────────────────
  static toPersistence(entity: NotificationEntity): NotificationRow {
    return {
      id: entity.id,
      user_id: entity.user_id,
      title: entity.title,
      body: entity.body,
      type: entity.type,
      channel: entity.channel,
      status: entity.status,
      is_read: entity.is_read,
      reference_id: entity.reference_id!,
      reference_type: entity.reference_type!,
      read_at: entity.read_at!,
      sent_at: entity.sent_at!,
      failed_reason: entity.failed_reason!,
      created_at: entity.created_at,
    };
  }

  // ─────────────────────────────────────────────
  // ✅ Row[] → Entity[]
  // ─────────────────────────────────────────────
  static toEntityArray(rows: NotificationRow[]): NotificationEntity[] {
    return rows.map(this.toEntity);
  }

  // ─────────────────────────────────────────────
  // ✅ Entity[] → ResponseDto[]
  // ─────────────────────────────────────────────
  static toResponseDtoArray(entities: NotificationEntity[]): NotificationResponse[] {
    return entities.map(this.toResponseDto);
  }
}