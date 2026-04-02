
import {injectable, inject} from "tsyringe"
import { IMealAttendanceRepository } from "./IMeal_Attendance.Repository";
import { MealAttendance, MealAttendanceRow } from "@/config/models";
import { createMealAttendanceSchemaDto, MealSlotEnumType, updateMealAttendanceSchemaDto } from "../dtos/Meal_AttendanceDtos";
import { TOKENS } from "@/helper/user_and_auth/token";
import type { DbOrTx } from "@/config/database/database";
import { InternalServerError } from "@/globalError/AppError";
import { and, asc, eq, gte, lte } from "drizzle-orm";


@injectable()
export class MealAttendanceRepository implements IMealAttendanceRepository{
    constructor(@inject(TOKENS.DB) private db:DbOrTx){}


    async create_meal_attendence(data: createMealAttendanceSchemaDto, userId:string): Promise<MealAttendanceRow> {
        const [row] = await this.db.insert(MealAttendance).values({
                 user_id: data.userId,
                 subscription_id: data.subscriptionId,
                 daily_menu_id: data.dailyMenuId,
                 slot: data.slot,                          // breakfast | lunch | snacks | dinner
                 attendance_date: data.attendanceDate,     // date
                 is_consumed: data.isConsumed ?? false,    // default false
                 scanned_at: data.scannedAt ?? null,       // optional
                 scanned_by: data.scannedBy ?? null,       // optional
                 created_by: userId,               // required
                 updated_by: userId,               // initially same
                 }).returning();

        if(!row){
            throw new InternalServerError("Failed to create Meal Attendance");  
        }
        return row;
    }


    async update_meal_attendance(data: updateMealAttendanceSchemaDto, id:string, userId:string): Promise<MealAttendanceRow> {
                const [row] = await this.db.update(MealAttendance)
                                        .set({
                                              ...data,
                                              updated_at:new Date(),
                                              updated_by:userId
                                        })
                                        .where(eq(MealAttendance.id,id))
                                        .returning()
                if(!row){
                     throw new InternalServerError("Failed to create Meal Attendance");  
                     }                        
                return row                         
                                          
    }
    async fetch_meal_attendance_by_id(id: string): Promise<MealAttendanceRow | null> {
            return await this.db.select()
                                .from(MealAttendance)
                                .where(eq(MealAttendance.id,id))
                                .then(row => row[0] || null)
    }

    async getByUserAndDateAndSlot(userId: string, attendanceDate: Date, slot: MealSlotEnumType): Promise<MealAttendanceRow | null> {
          return await this.db.select()
                              .from(MealAttendance)
                              .where(
                                and(
                                    eq(MealAttendance.user_id,userId),
                                     eq(MealAttendance.attendance_date,attendanceDate),
                                     eq(MealAttendance.slot, slot)
                                ))
                                .then(row => row[0] || null)
    }

    async getByUserId(userId: string): Promise<MealAttendanceRow[]> {
             return await this.db.select()
                                .from(MealAttendance)
                                .where(eq(MealAttendance.user_id,userId))
                                .limit(1)
                                
    }

    async getByDateRange(startDate: Date, endDate: Date): Promise<MealAttendanceRow[]> {
        
           const rows = await this.db.select()
                                  .from(MealAttendance)
                                  .where(
                                        and(
                                             gte(MealAttendance.attendance_date, startDate),
                                             lte(MealAttendance.attendance_date, endDate))
                                  )
                                    .orderBy( asc(MealAttendance.attendance_date),asc(MealAttendance.slot));
            
            return rows;
               
    }
}