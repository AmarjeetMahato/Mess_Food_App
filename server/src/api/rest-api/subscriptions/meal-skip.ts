import { MealSkipController } from "@/domain/subscription/meal-skip/controllers/Meal_Skip.Controller";
import {  MealSkipParamsSchema, MealSkipUpdateSchema } from "@/domain/subscription/meal-skip/dtos/Meal_SkipDtos";
import { validateRequest } from "@/utils/Zodvalidate";
import express from "express";
import { container } from "tsyringe";



const router = express.Router();


const mealSkipController = container.resolve(MealSkipController);

router.post("/meal-skip/create", validateRequest({ 
    params: MealSkipParamsSchema,
    body: MealSkipUpdateSchema}),mealSkipController.create_mealSkip)

router.patch("/meal-skip/:id/update", validateRequest({
       params: MealSkipParamsSchema,
       body:MealSkipUpdateSchema,
}),mealSkipController.update_mealSkip);

router.get("/meal-skip/:id", validateRequest({ params:MealSkipParamsSchema}), )


export default router;