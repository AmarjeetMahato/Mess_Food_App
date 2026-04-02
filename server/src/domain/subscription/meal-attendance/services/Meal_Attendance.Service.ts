import {injectable, inject} from 'tsyringe'
import { IMealAttendanceService } from './IMeal_Attendance.Service';
import { createMealAttendanceSchemaDto, mealAttendanceResponseSchemaDto, updateMealAttendanceSchemaDto, MealSlotEnumType } from '../dtos/Meal_AttendanceDtos';
import { TOKENS } from '@/helper/subscriptions/tokens';
import type { IMealAttendanceRepository } from '../repository/IMeal_Attendance.Repository';
import { BadRequestError, ConflictError, NotFoundError } from '@/globalError/AppError';
import { MealAttendanceMapper } from '../mapper/Meal_Attendance.Mapper';


@injectable()
export class MealAttendanceService implements IMealAttendanceService{
     constructor(@inject(TOKENS.MealAttendanceRepository) private readonly repository:IMealAttendanceRepository){}


     async create_meal_attendence(data: createMealAttendanceSchemaDto, userId:string): Promise<mealAttendanceResponseSchemaDto> {
              
           if(!userId){
                  throw new BadRequestError("userId is required");      
           }

           if(!data){
                  throw new BadRequestError("Invalid fields value");  
           }
          
           // ─────────────────────────────────────────────
          // ✅ Business Validation: Prevent Duplicate Attendance
          // ─────────────────────────────────────────────

          const existingAttendance  = await this.repository.getByUserAndDateAndSlot(userId,data.attendanceDate,data.slot);
          if(existingAttendance){
               throw new ConflictError( `Attendance already exists for ${data.slot} on ${data.attendanceDate.toDateString()}`);    
          }

          // ─────────────────────────────────────────────
          // ✅ Business Validation: Subscription Check (IMPORTANT)
          // ─────────────────────────────────────────────

          const subscription = await this.repository.fetch_meal_attendance_by_id(data.subscriptionId!);
          if(!subscription || !subscription.id){
               throw new NotFoundError("Subscription not found");
          }

         

           const row = await await this.repository.create_meal_attendence(data, userId);
           const entity = MealAttendanceMapper.toEntity(row);
           return MealAttendanceMapper.toResponseDto(entity);
              
     }
     update_meal_attendance(data: updateMealAttendanceSchemaDto, id: string, userId: string): Promise<mealAttendanceResponseSchemaDto> {
          throw new Error('Method not implemented.');
     }
     fetch_meal_attendance_by_id(id: string): Promise<mealAttendanceResponseSchemaDto | null> {
          throw new Error('Method not implemented.');
     }
     getByUserAndDateAndSlot(userId: string, attendanceDate: Date, slot: MealSlotEnumType): Promise<mealAttendanceResponseSchemaDto | null> {
          throw new Error('Method not implemented.');
     }
     getByUserId(userId: string): Promise<mealAttendanceResponseSchemaDto[]> {
          throw new Error('Method not implemented.');
     }
     getByDateRange(startDate: Date, endDate: Date): Promise<mealAttendanceResponseSchemaDto[]> {
          throw new Error('Method not implemented.');
     }
}