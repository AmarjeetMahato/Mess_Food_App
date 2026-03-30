// src/modules/menu/menu-item.mapper.ts

import { MenuItemRow } from "@/config/models";
import { MenuItemResponseDto, MenuItemListResponseDto } from "../dtos/MenuItemDtos";
import { MenuItemEntity } from "../entity/Menu.Entity";

export class MenuItemMapper {

  // ── DB row → Domain Entity ─────────────────────────────────────────
  static toDomain(row: MenuItemRow): MenuItemEntity {
    return new MenuItemEntity(
      row.id,
      row.name,
      row.description  ?? null,
      row.category,
      row.image_url    ?? null,
      row.is_available,
      row.created_at,
      row.updated_at,
    );
  }

  // ── Domain Entity → Response DTO ───────────────────────────────────
  static toResponseDto(entity: MenuItemEntity): MenuItemResponseDto {
    return {
      id:           entity.id,
      name:         entity.name,
      description:  entity.description,
      category:     entity.category,
      image_url:    entity.imageUrl,
      is_available: entity.isAvailable,
      created_at:   entity.createdAt.toISOString(),
      updated_at:   entity.updatedAt.toISOString(),
    };
  }

  // ── DB row → Response DTO (shortcut) ───────────────────────────────
  static rowToResponseDto(row: MenuItemRow): MenuItemResponseDto {
    return MenuItemMapper.toResponseDto(MenuItemMapper.toDomain(row));
  }

  // ── List of rows → MenuItemListResponseDto ─────────────────────────
  static toListResponseDto(
    rows:  MenuItemRow[],
    total: number,
  ): MenuItemListResponseDto {
    return {
      items: rows.map(MenuItemMapper.rowToResponseDto),
      total,
    };
  }
}