import { MenuItemRepository } from "@/domain/menu/menu-item/repository/Menu_Item.Repository";
import { MenuItemService } from "@/domain/menu/menu-item/services/Menu_Item.Service";


export const TOKENS = {
   
    DB:Symbol("DB"),

    // MenuItems
    MenuItemRepository:Symbol("MenuItemRepository"),
    MenuItemService: Symbol("MenuItemService"),
    MenuItemController : Symbol("MenuItemController"),

    // DailyMenu
     DailyMenuRepository: Symbol("DailyMenuRepository"),
     DailyMenuService: Symbol("DailyMenuService"),
     DailyMenuController: Symbol("DailyMenuController"),

    //  MealPlanTemplate
     MealPlanTemplateRepository: Symbol("MealPlanTemplateRepository"),
     MealPlanTemplateService: Symbol("MealPlanTemplateService"),
     MealPlanTemplateController: Symbol("MealPlanTemplateController"),

    //  MealItemMapping
     MenuItemMappingRepository: Symbol("MenuItemMappingRepository"),
     MenuItemMappingService: Symbol("MenuItemMappingService"),
     MenuItemMappingController: Symbol("MenuItemMappingController"),
}