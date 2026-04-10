


export class MenuItemMappingEntity{
       constructor(
            public readonly id:string,
            public  daily_menu_id:string,
            public  menu_item_id:string,
            public  quantity_description: string | null,
            public readonly created_at: Date,
            public  updated_at: Date
       ){}
}