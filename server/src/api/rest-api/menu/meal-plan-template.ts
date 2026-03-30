import { MealPlanTemplateController } from "@/domain/menu/meal-plan-template/controllers/MealPlanTemplate";
import express from "express";
import { container } from "tsyringe";

const router = express.Router();

const mealPlanTemplateController = container.resolve(MealPlanTemplateController);

router.post("meal_plan_templates/create", mealPlanTemplateController.createMealPlanTemplate);
router.get("meal_plan_templates/:id", mealPlanTemplateController.fetchMealPlanTemplateById);
router.patch("meal_plan_templates/:id/update", mealPlanTemplateController.upateMealPlanTemplate);
router.delete("meal_plan_templates/:id/delete", mealPlanTemplateController.deleteMealPlanTemplate);

export default router;