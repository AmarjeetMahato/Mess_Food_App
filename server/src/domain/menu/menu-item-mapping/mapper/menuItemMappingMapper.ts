import { MenuItemMappingRow } from "@/config/models";
import { MenuItemMappingEntity } from "../entity/menuItemMappingEntity";
import { CreateMenuItemMappingDto, MenuItemMappingListResponseDto, MenuItemMappingResponseDto, UpdateMenuItemMappingDto } from "../dtos/menu-item-mapping";


export class MenuItemMappingMapper {

  // ── DB Row → Domain Entity ─────────────────────────────────────────
  static toEntity(row: MenuItemMappingRow): MenuItemMappingEntity {
    return new MenuItemMappingEntity(
      row.id,
      row.daily_menu_id,
      row.menu_item_id,
      row.quantity_description ?? null,
      row.created_at,
      row.updated_at
    );
  }

  // ── Create DTO → Domain Entity ─────────────────────────────────────
  static toCreateEntity(dto: CreateMenuItemMappingDto): MenuItemMappingEntity {
    const now = new Date();

    return new MenuItemMappingEntity(
      dto.id!,
      dto.daily_menu_id,
      dto.menu_item_id,
      dto.quantity_description ?? null,
      new Date(0),
      new Date(0)
    );
  }

  // ── Domain Entity → Response DTO ───────────────────────────────────
  static toResponseDto(
    entity: MenuItemMappingEntity
  ): MenuItemMappingResponseDto {
    return {
      id: entity.id,
      daily_menu_id: entity.daily_menu_id,
      menu_item_id: entity.menu_item_id,
      quantity_description: entity.quantity_description,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  // ── Domain Entity → DB Persistence ─────────────────────────────────
  static toPersistence(entity: MenuItemMappingEntity): MenuItemMappingRow {
    return {
      id: entity.id,
      daily_menu_id: entity.daily_menu_id,
      menu_item_id: entity.menu_item_id,
      quantity_description: entity.quantity_description,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  // ── DB Rows → Domain Entities ──────────────────────────────────────
  static toEntityArray(rows: MenuItemMappingRow[]): MenuItemMappingEntity[] {
    return rows.map(this.toEntity);
  }

  // ── Domain Entities → Response DTOs ────────────────────────────────
  static toResponseDtoArray(entities: MenuItemMappingEntity[]): MenuItemMappingResponseDto[] {
       return entities.map(this.toResponseDto);
  }

  // ── List Response (Pagination) ─────────────────────────────────────
  static toListResponseDto(entities: MenuItemMappingEntity[],total: number): MenuItemMappingListResponseDto {
    return {
      items: entities.map(this.toResponseDto),
      total,
    };
  }


  static applyUpdate(entity:MenuItemMappingEntity,dto:UpdateMenuItemMappingDto):MenuItemMappingEntity{
        
       if (dto.daily_menu_id !== undefined) {
    entity.daily_menu_id = dto.daily_menu_id;
  }

  if (dto.menu_item_id !== undefined) {
    entity.menu_item_id = dto.menu_item_id;
  }

  if (dto.quantity_description !== undefined) {
    entity.quantity_description = dto.quantity_description ?? null;
  }

  entity.updated_at = new Date();


      return entity;
  }
}