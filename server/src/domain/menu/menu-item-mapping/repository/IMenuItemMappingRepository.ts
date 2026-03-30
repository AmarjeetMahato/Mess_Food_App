import { MenuItemMappingRow } from "@/config/models";
import { CreateMenuItemMappingDto, UpdateMenuItemMappingDto } from "../dtos/menu-item-mapping";


export interface IMenuItemMappingRepository {

       createMenuItemMapping(dto: CreateMenuItemMappingDto): Promise<MenuItemMappingRow>;

       findById(id: string): Promise<MenuItemMappingRow | null>;

       update(id: string, dto:UpdateMenuItemMappingDto): Promise<MenuItemMappingRow | null>;

       delete(id: string): Promise<number>;

       findAll(): Promise<MenuItemMappingRow[]>;
}