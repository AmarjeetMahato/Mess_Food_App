
import {injectable, inject} from "tsyringe"
import { IMealAttendanceRepository } from "./IMeal_Attendance.Repository";
import { MealAttendance, MealAttendanceRow } from "@/config/models";
import { createMealAttendanceSchemaDto, MealSlotEnumType, updateMealAttendanceSchemaDto } from "../dtos/Meal_AttendanceDtos";
import { TOKENS } from "@/helper/user_and_auth/token";
import type { DbOrTx } from "@/config/database/database";
import { InternalServerError } from "@/globalError/AppError";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { MealAttendanceEntity } from "../entity/meal-attendance-entity";
import { MealAttendanceMapper } from "../mapper/Meal_Attendance.Mapper";


@injectable()
export class MealAttendanceRepository implements IMealAttendanceRepository{
    constructor(@inject(TOKENS.DB) private db:DbOrTx){}


    async create_meal_attendence(entity: MealAttendanceEntity): Promise<MealAttendanceRow> {
         const payload  = MealAttendanceMapper.toPersistence(entity)
        const [row] = await this.db.insert(MealAttendance)
                                    .values(payload)
                                    .returning();

        if(!row){
            throw new InternalServerError("Failed to create Meal Attendance");  
        }
        return row;
    }


    async update_meal_attendance(entity: MealAttendanceEntity, id:string): Promise<MealAttendanceRow> {

                const payload =  MealAttendanceMapper.toPersistence(entity)
                const [row] = await this.db.update(MealAttendance)
                                        .set({
                                              ...payload,
                                              updated_at:new Date(),
                                              updated_by:entity.userId
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