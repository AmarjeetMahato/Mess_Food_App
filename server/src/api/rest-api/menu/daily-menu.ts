import { DailyMenuController } from "@/domain/menu/daily-menu/controllers/Daily_Menu.Controllers";
import express from "express";
import { container } from "tsyringe";




const router = express.Router();

const dailyMenuController = container.resolve(DailyMenuController);
router.post("daily_menu/create", dailyMenuController.createDailyMenu);
router.patch("daily_menu/:id/update", dailyMenuController.updateDailyMenu);
router.patch("daily_menu/:id/deactivate", dailyMenuController.deactiveteDailyMenu);
router.patch("daily_menu/:id/activate", dailyMenuController.activeteDailyMenu);
router.delete("daily_menu/:id/delete", dailyMenuController.deleteDailyMenu);


export default router;