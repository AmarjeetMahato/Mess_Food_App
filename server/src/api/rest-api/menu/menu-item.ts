import { MenuItemController } from "@/domain/menu/menu-item/controllers/Menu_Item.Controllers";
import { CreateMenuItemSchema, CreateMenuItemSchemaParams, UpdateMenuItemSchema,  } from "@/domain/menu/menu-item/dtos/MenuItemDtos";
import { validateRequest } from "@/utils/Zodvalidate";
import express from "express"
import { container } from "tsyringe";


const router = express.Router()

const menuItemController = container.resolve(MenuItemController)

router.post("menu_item/create",validateRequest({
      body:CreateMenuItemSchema
}), menuItemController.create);

router.get("menu_item/get_all", menuItemController.getAll);

router.get("menu_item/get_menu_item/:id",validateRequest({
      params:CreateMenuItemSchemaParams
}) ,menuItemController.getById);

router.patch("menu_item/:id/update_menu_item",validateRequest({
      body:UpdateMenuItemSchema,
      params: CreateMenuItemSchemaParams
}), menuItemController.update);

router.delete("menu_item/:id/delete",validateRequest({
params:CreateMenuItemSchemaParams}), menuItemController.delete)

export default router;