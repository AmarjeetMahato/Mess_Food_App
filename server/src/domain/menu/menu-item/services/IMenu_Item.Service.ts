import { MenuItemResponseDto, MenuItemListResponseDto, CreateMenuItemDto, UpdateMenuItemDto, ListMenuItemsDto } from "../dtos/MenuItemDtos";

export interface IMenuItemService {
  getById(id: string): Promise<MenuItemResponseDto>;
  getAll(dto: ListMenuItemsDto): Promise<MenuItemListResponseDto>;
  create(dto: CreateMenuItemDto): Promise<MenuItemResponseDto>;
  update(id: string, dto: UpdateMenuItemDto): Promise<MenuItemResponseDto>;
  delete(id: string): Promise<void>;
}
 