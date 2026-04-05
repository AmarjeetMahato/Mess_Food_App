import { MealAttendanceRow } from "@/config/models";
import { createMealAttendanceSchemaDto, MealSlotEnumType, updateMealAttendanceSchemaDto } from "../dtos/Meal_AttendanceDtos";
import { MealAttendanceEntity } from "../entity/meal-attendance-entity";

export interface IMealAttendanceRepository{


    create_meal_attendence(entity:MealAttendanceEntity):Promise<MealAttendanceRow>
    
    update_meal_attendance(data:MealAttendanceEntity, id:string):Promise<MealAttendanceRow>

    fetch_meal_attendance_by_id(id:string):Promise<MealAttendanceRow | null>

    // 🔥 VERY IMPORTANT (QR scan flow)
    getByUserAndDateAndSlot(userId: string,attendanceDate: Date,slot: MealSlotEnumType): Promise<MealAttendanceRow | null>;

    // 🔥 For analytics / admin
    getByUserId(userId: string): Promise<MealAttendanceRow[]>;

    // 🔥 Optional (date range queries)
    getByDateRange(startDate: Date,endDate: Date): Promise<MealAttendanceRow[]>;


}