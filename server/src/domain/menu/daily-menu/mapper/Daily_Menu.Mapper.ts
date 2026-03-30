// src/modules/menu/daily-menu.mapper.ts

import { MenuItemRow, DailyMenuRow } from "@/config/models";
import { ThreeDayMenuResponseDto } from "../../meal-plan-template/dtos/MealPlanTemplate";
import { MenuItemEntity } from "../../menu-item/entity/Menu.Entity";
import { DailyMenuResponseDto, MealSlot, MenuItemInSlotDto, MenuItemResponseDto } from "../dtos/DailyMenuDtos";
import { DailyMenuEntity } from "../entity/Daily_Menu.Entity";


// ── Helper ─────────────────────────────────────────────────────────────────
const toDateStr = (date: Date): string => date.toISOString().substring(0, 10);

export class DailyMenuMapper {

  // ── MenuItemRow → MenuItemEntity ───────────────────────────────────
  static toMenuItemDomain(row: MenuItemRow): MenuItemEntity {
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

  // ── DailyMenuRow + items → DailyMenuEntity ─────────────────────────
  static toDomain(row:   DailyMenuRow,items: MenuItemRow[] = []): DailyMenuEntity {
    return new DailyMenuEntity(
      row.id,
      row.menu_date,
      row.slot,
      row.is_active,
      row.created_by  ?? null,
      items.map(DailyMenuMapper.toMenuItemDomain),
      row.created_at,
      row.updated_at,
    );
  }

  // ── MenuItemEntity → MenuItemInSlotDto ─────────────────────────────
  static toMenuItemInSlotDto(entity: MenuItemEntity): MenuItemInSlotDto {
    return {
      id:           entity.id,
      name:         entity.name,
      description:  entity.description,
      category:     entity.category,
      image_url:    entity.imageUrl,
      is_available: entity.isAvailable,
    };
  }

    // ✅ FIXED: correct item mapper
  static toMenuItemResponseDto(entity: MenuItemEntity): MenuItemResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      category: entity.category,
      image_url: entity.imageUrl,
      is_available: entity.isAvailable,
      created_at: entity.createdAt.toISOString(),   // ✅ REQUIRED
      updated_at: entity.updatedAt.toISOString(),   // ✅ REQUIRED
    };
  }

  // ── DailyMenuEntity → DailyMenuResponseDto ─────────────────────────
  static toResponseDto(entity: DailyMenuEntity): DailyMenuResponseDto {
    return {
      id:         entity.id,
      menu_date:  toDateStr(entity.menuDate),
      slot:       entity.slot,
      is_active:  entity.isActive,
      items:      entity.items.map(DailyMenuMapper.toMenuItemResponseDto),
      created_by: entity.createdBy,
      created_at: entity.createdAt.toISOString(),
      updated_at: entity.updatedAt.toISOString(),
    };
  }

  // ── DB row + items → Response DTO (shortcut) ───────────────────────
  static rowToResponseDto( row:   DailyMenuRow,items: MenuItemRow[] = []): DailyMenuResponseDto {
    return DailyMenuMapper.toResponseDto(
      DailyMenuMapper.toDomain(row, items),
    );
  }

  // ── Build 3-day menu response ──────────────────────────────────────
  // Groups flat array of entities by date + slot
  static toThreeDayDto(
    entities:  DailyMenuEntity[],
    startDate: Date,
  ): ThreeDayMenuResponseDto[] {
    return Array.from({ length: 3 }, (_, i) => {
      const date    = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = toDateStr(date);

      const dayMenus = entities.filter(
        (e) => toDateStr(e.menuDate) === dateStr,
      );

      const findSlot = (slot: MealSlot): DailyMenuResponseDto | null => {
        const found = dayMenus.find((e) => e.slot === slot);
        return found ? DailyMenuMapper.toResponseDto(found) : null;
      };

      return {
        date: dateStr,
        slots: {
          breakfast: findSlot('breakfast'),
          lunch:     findSlot('lunch'),
          snacks:    findSlot('snacks'),
          dinner:    findSlot('dinner'),
        },
      };
    });
  }
}