import { DrizzleDb, db } from "@/config/database/database";
import { container, Lifecycle } from "tsyringe";
import { TOKENS } from "./token";
import { MenuItemRepository } from "@/domain/menu/menu-item/repository/Menu_Item.Repository";
import { MenuItemService } from "@/domain/menu/menu-item/services/Menu_Item.Service";
import { MenuItemController } from "@/domain/menu/menu-item/controllers/Menu_Item.Controllers";
import { DailyMenuRepository } from "@/domain/menu/daily-menu/repository/Daily_Menu.Repository";
import { DailyMenuService } from "@/domain/menu/daily-menu/services/Daily_Menu.Services";
import { DailyMenuController } from "@/domain/menu/daily-menu/controllers/Daily_Menu.Controllers";
import { MealPlanTemplateRepository } from "@/domain/menu/meal-plan-template/repository/MealPlanTemplate.Repository";
import { MealPlanTemplateService } from "@/domain/menu/meal-plan-template/services/MealPlanTemplate.Service";
import { MealPlanTemplateController } from "@/domain/menu/meal-plan-template/controllers/MealPlanTemplate";
import { MenuItemMappingRepository } from "@/domain/menu/menu-item-mapping/repository/menuItemMappingRepository";
import { MenuItemMappingController } from "@/domain/menu/menu-item-mapping/controllers/menu-item-mapping.Controller";
import { MenuItemMappingService } from "@/domain/menu/menu-item-mapping/services/menuItemMappingService";



// 👉 Helper (optional but clean)
const singleton = (token: symbol, useClass: any) => {
  container.register(token, { useClass }, { lifecycle: Lifecycle.Singleton });
};

const transient = (token: symbol, useClass: any) => {
  container.register(token, { useClass });
};

// ==========================================
// 1. Database Connection (Static Value)
// ==========================================
container.register<DrizzleDb>(TOKENS.DB, { useValue: db });

// ================= MENUITEM =================
singleton(TOKENS.MenuItemRepository, MenuItemRepository);
singleton(TOKENS.MenuItemService, MenuItemService);
transient(TOKENS.MenuItemController, MenuItemController);

// ================= DAILYMENU =================
singleton(TOKENS.DailyMenuRepository, DailyMenuRepository);
singleton(TOKENS.DailyMenuService, DailyMenuService);
transient(TOKENS.DailyMenuController, DailyMenuController);

// ================= MEALPLANTEMPLATE =================
singleton(TOKENS.MealPlanTemplateRepository, MealPlanTemplateRepository);
singleton(TOKENS.MealPlanTemplateService, MealPlanTemplateService);
transient(TOKENS.MealPlanTemplateController, MealPlanTemplateController);

// ================= MEALITEMMAPPING =================
singleton(TOKENS.MenuItemMappingRepository, MenuItemMappingRepository);
singleton(TOKENS.MenuItemMappingService, MenuItemMappingService);
transient(TOKENS.MenuItemMappingController, MenuItemMappingController);
