import { MenuItemController } from "@/domain/menu/menu-item/controllers/Menu_Item.Controllers";
import express from "express"
import { container } from "tsyringe";


const router = express.Router()

const menuItemController = container.resolve(MenuItemController)

router.post("menu_item/create", menuItemController.create)
router.get("menu_item/get_all", menuItemController.getAll)
router.get("menu_item/get_menu_item/:id", menuItemController.getById)
router.patch("menu_item/:id/update_menu_item", menuItemController.update)
router.delete("menu_item/:id/delete", menuItemController.delete)

export default router;