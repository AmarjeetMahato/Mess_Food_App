// src/modules/menu/menu-item.service.ts

import { NotFoundError } from "@/globalError/AppError";
import { injectable, inject } from "tsyringe";
import { MenuItemResponseDto, MenuItemListResponseDto, CreateMenuItemDto, UpdateMenuItemDto, ListMenuItemsDto } from "../dtos/MenuItemDtos";
import { MenuItemMapper } from "../mapper/Menu_Item.Mapper";
import type { IMenuItemRepository } from "../repository/IMenu_Item.Repository";
import { IMenuItemService } from "./IMenu_Item.Service";
import { TOKENS } from "@/helper/menu/token";

@injectable()
export class MenuItemService implements IMenuItemService {

  constructor(
    @inject(TOKENS.MenuItemRepository)
    private readonly repo: IMenuItemRepository,
  ) {}

  // ── Get by ID ──────────────────────────────────────────────────────
  async getById(id: string): Promise<MenuItemResponseDto> {
    const row = await this.repo.findById(id);

    if (!row) throw new NotFoundError('Menu item not found');

    return MenuItemMapper.rowToResponseDto(row);
  }

  // ── Get all ────────────────────────────────────────────────────────
  async getAll(dto: ListMenuItemsDto): Promise<MenuItemListResponseDto> {
    const { rows, total } = await this.repo.findAll(dto);
    return MenuItemMapper.toListResponseDto(rows, total);
  }

  // ── Create ─────────────────────────────────────────────────────────
  async create(
    dto:     CreateMenuItemDto,
    adminId: string,
  ): Promise<MenuItemResponseDto> {
    const row = await this.repo.create(dto);
    return MenuItemMapper.rowToResponseDto(row);
  }

  // ── Update ─────────────────────────────────────────────────────────
  async update(
    id:  string,
    dto: UpdateMenuItemDto,
  ): Promise<MenuItemResponseDto> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Menu item not found');

    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundError('Menu item not found');

    return MenuItemMapper.rowToResponseDto(updated);
  }

  // ── Delete ─────────────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Menu item not found');

    await this.repo.delete(id);
  }
}