import express from "express";
import { container } from "tsyringe";
import { MenuItemMappingController } from "@/domain/menu/menu-item-mapping/controllers/menu-item-mapping.Controller";



const router = express.Router();

const menuItemMappingController = container.resolve(MenuItemMappingController);
router.post("menu_item_mapping/create", menuItemMappingController.createMenuItemMapping);
router.get("menu_item_mapping/:id", menuItemMappingController.fetchMenuItemMappingById);
router.patch("menu_item_mapping/:id/update", menuItemMappingController.updateMenuItemMapping);
// router.delete("menu_item_mapping/:id/delete", menuItemMappingController.deleteMenuItemMapping);

export default router;