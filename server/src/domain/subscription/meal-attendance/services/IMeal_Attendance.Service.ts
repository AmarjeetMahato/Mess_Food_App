import { createMealAttendanceSchemaDto, mealAttendanceResponseSchemaDto, MealSlotEnumType, updateMealAttendanceSchemaDto } from "../dtos/Meal_AttendanceDtos";



export interface IMealAttendanceService{
   
    
        create_meal_attendence(data:createMealAttendanceSchemaDto, userId:string):Promise<mealAttendanceResponseSchemaDto>
        
        update_meal_attendance(data:updateMealAttendanceSchemaDto, id:string, userId:string):Promise<mealAttendanceResponseSchemaDto>
    
        fetch_meal_attendance_by_id(id:string):Promise<mealAttendanceResponseSchemaDto | null>
    
        // 🔥 VERY IMPORTANT (QR scan flow)
        getByUserAndDateAndSlot(userId: string,attendanceDate: Date,slot: MealSlotEnumType): Promise<mealAttendanceResponseSchemaDto | null>;
    
        // 🔥 For analytics / admin
        getByUserId(userId: string): Promise<mealAttendanceResponseSchemaDto[]>;
    
        // 🔥 Optional (date range queries)
        getByDateRange(startDate: Date,endDate: Date): Promise<mealAttendanceResponseSchemaDto[]>;
    
    
}