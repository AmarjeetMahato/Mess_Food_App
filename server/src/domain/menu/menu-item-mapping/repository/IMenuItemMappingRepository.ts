import { MenuItemMappingRow } from "@/config/models";
import { CreateMenuItemMappingDto, UpdateMenuItemMappingDto } from "../dtos/menu-item-mapping";
import { MenuItemMappingEntity } from "../entity/menuItemMappingEntity";


export interface IMenuItemMappingRepository {

       createMenuItemMapping(entity: MenuItemMappingEntity): Promise<MenuItemMappingRow>;

       findById(id: string): Promise<MenuItemMappingRow | null>;

       update(id: string, entity:MenuItemMappingEntity): Promise<MenuItemMappingRow | null>;

       delete(id: string): Promise<number>;

       findByMenuAndItem(daily_menuId:string, menuItemId:string) : Promise<MenuItemMappingRow | null>

       findAll(): Promise<MenuItemMappingRow[]>;
}