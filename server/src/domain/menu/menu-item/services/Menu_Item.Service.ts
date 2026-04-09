// src/modules/menu/menu-item.service.ts

import { BadRequestError, NotFoundError } from "@/globalError/AppError";
import { injectable, inject } from "tsyringe";
import { MenuItemResponseDto, MenuItemListResponseDto, CreateMenuItemDto, UpdateMenuItemDto, ListMenuItemsDto } from "../dtos/MenuItemDtos";
import { MenuItemMapper } from "../mapper/Menu_Item.Mapper";
import type { IMenuItemRepository } from "../repository/IMenu_Item.Repository";
import { IMenuItemService } from "./IMenu_Item.Service";
import { TOKENS } from "@/helper/menu/token";

@injectable()
export class MenuItemService implements IMenuItemService {

  constructor(@inject(TOKENS.MenuItemRepository) private readonly repo: IMenuItemRepository) {}

  // ── Get by ID ──────────────────────────────────────────────────────
  async getById(id: string): Promise<MenuItemResponseDto> {
    if(!id){
         throw new BadRequestError("Id shouldn't be empty or null")
    }
    const row = await this.repo.findById(id);
    if(!row || !row.id){
        throw new NotFoundError("Menu item not found")
    }
    const entity = MenuItemMapper.toDomain(row);
    return MenuItemMapper.toResponseDto(entity);
  }

  // ── Get all ────────────────────────────────────────────────────────
  async getAll(dto: ListMenuItemsDto): Promise<MenuItemListResponseDto> {
    const { rows, total } = await this.repo.findAll(dto);
    const entities = MenuItemMapper.toEntityArray(rows);
    return MenuItemMapper.toListResponseDto(entities, total);
  }

  // ── Create ─────────────────────────────────────────────────────────
  async create(dto:CreateMenuItemDto): Promise<MenuItemResponseDto> {
       if(!dto){
         throw new BadRequestError("Invalid fields value");
       }
      const createEntity = MenuItemMapper.toCreateEntity(dto);

      const row = await this.repo.create(createEntity);
      const entity = MenuItemMapper.toDomain(row);
      return MenuItemMapper.toResponseDto(entity);
  }

  // ── Update ─────────────────────────────────────────────────────────
  async update(id:  string,dto: UpdateMenuItemDto): Promise<MenuItemResponseDto> {
    if(!id){
         throw new BadRequestError("Id shouldn't be empty or null");
    }
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Menu item not found');
    
    const entity = MenuItemMapper.toDomain(existing);
    if(!entity.isAvailable){
         throw new BadRequestError("Menu item is not available")
    }
    const updated = await this.repo.update(id,entity);
    if (!updated || !updated.id) throw new NotFoundError('Menu item not found');
    
    const updateEntity = MenuItemMapper.toDomain(updated);
    return MenuItemMapper.toResponseDto(updateEntity);
  }

  // ── Delete ─────────────────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundError('Menu item not found');

    await this.repo.delete(id);
  }
}