import { MenuItemMappingEntity } from "../entity/menuItemMappingEntity";


export class MenuItemMappingMapper {
    static toEntity(row: any): MenuItemMappingEntity {
        return new MenuItemMappingEntity(
            row.id,
            row.daily_menu_id,
            row.menu_item_id,
            row.quantity_description,
            row.created_at,
            row.updated_at
        );
    }

    static toResponseDto(entity: MenuItemMappingEntity):MenuItemMappingEntity {
        return {
            id: entity.id,
            daily_menu_id: entity.daily_menu_id,
            menu_item_id: entity.menu_item_id,
            quantity_description: entity.quantity_description,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }


}