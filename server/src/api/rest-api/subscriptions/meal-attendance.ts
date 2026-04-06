import { MealAttendanceController } from "@/domain/subscription/meal-attendance/controllers/Meal_Attendance.Controller";
import { createMealAttendanceSchema,createMealAttendanceSchemaParams,
    updateMealAttendanceSchema
 } from "@/domain/subscription/meal-attendance/dtos/Meal_AttendanceDtos";
import { validateRequest } from "@/utils/Zodvalidate";
import express from "express";
import { container } from "tsyringe";


const router  = express.Router();


const mealAttendanceController =  container.resolve(MealAttendanceController);

router.post("/meal-attendance/create", validateRequest({
        body:createMealAttendanceSchema
}), mealAttendanceController.create_mealAttendance);

router.patch("/meal-attendance/:id/update",validateRequest({
        body:updateMealAttendanceSchema,
        params:createMealAttendanceSchemaParams
}) ,mealAttendanceController.update_mealAttendance);

router.get("/meal-attendance/:id",validateRequest({
    params:createMealAttendanceSchemaParams
}), mealAttendanceController.fetch_meal_attendance_by_id);

router.get("/meal-attendance/get-by-userId", mealAttendanceController.fetchByUserId);

router.get("/meal-attendance/get-by-date", mealAttendanceController.getByDateRange);


export default router;