


export class MenuItemMappingEntity{
       constructor(
            public readonly id:string,
            public readonly daily_menu_id:string,
            public readonly menu_item_id:string,
            public readonly quantity_description: string | null,
            public readonly created_at: Date,
            public readonly updated_at: Date
       ){}
}