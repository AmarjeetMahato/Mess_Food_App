import express from "express";
import { container } from "tsyringe";
import { MenuItemMappingController } from "@/domain/menu/menu-item-mapping/controllers/menu-item-mapping.Controller";
import { validateRequest } from "@/utils/Zodvalidate";
import { CreateMenuItemMappingSchema, MenuItemMappingParamsSchemaParams, UpdateMenuItemMappingSchema } from "@/domain/menu/menu-item-mapping/dtos/menu-item-mapping";



const router = express.Router();

const menuItemMappingController = container.resolve(MenuItemMappingController);

router.post("menu_item_mapping/create", validateRequest({
      body:CreateMenuItemMappingSchema
}), menuItemMappingController.createMenuItemMapping);

router.get("menu_item_mapping/:id",validateRequest({
     params:MenuItemMappingParamsSchemaParams
}), menuItemMappingController.fetchMenuItemMappingById);

router.patch("menu_item_mapping/:id/update",validateRequest({
      body:UpdateMenuItemMappingSchema,
      params:MenuItemMappingParamsSchemaParams
}), menuItemMappingController.updateMenuItemMapping);

router.delete("menu_item_mapping/:id/delete",validateRequest({
     params:MenuItemMappingParamsSchemaParams
}), menuItemMappingController.deleteMenuItemMapping);

router.delete("menu_item_mapping/get_all", menuItemMappingController.fetchAll);


export default router;