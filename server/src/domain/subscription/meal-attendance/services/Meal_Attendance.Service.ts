import {injectable, inject} from 'tsyringe'
import { IMealAttendanceService } from './IMeal_Attendance.Service';
import { createMealAttendanceSchemaDto, mealAttendanceResponseSchemaDto, updateMealAttendanceSchemaDto, MealSlotEnumType } from '../dtos/Meal_AttendanceDtos';
import { TOKENS } from '@/helper/subscriptions/tokens';
import type { IMealAttendanceRepository } from '../repository/IMeal_Attendance.Repository';
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '@/globalError/AppError';
import { MealAttendanceMapper } from '../mapper/Meal_Attendance.Mapper';
import type { ISubscriptionRepository } from '../../subscriptions/repository/ISubscription.Repository';
import { SubscriptionMapper } from '../../subscriptions/mapper/Subscription.Mapper';


@injectable()
export class MealAttendanceService implements IMealAttendanceService{
     constructor(
          @inject(TOKENS.MealAttendanceRepository) private readonly repository:IMealAttendanceRepository,
          @inject(TOKENS.SubscriptionRepository) private readonly subscriptionRepository:ISubscriptionRepository
     ){}


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
            // ✅ FIX: Use subscriptionRepository
            const subscription = await this.subscriptionRepository.getById(data.subscriptionId)
          if(!subscription || !subscription.id){
               throw new NotFoundError("Subscription not found");
          }

          const subscriptionEntity = SubscriptionMapper.toEntity(subscription);

          if(!subscriptionEntity.isActive()){
                   throw new BadRequestError("Subcription is not active");
          }

          if(!subscriptionEntity.isSlotAllowed(data.slot)){
               throw new BadRequestError(`Subscription does not include ${data.slot}`)
          }

          const createEntity = MealAttendanceMapper.toCreateEntity({
                                  ...data,
                                  createdBy:userId
          })

          const row = await this.repository.create_meal_attendence(createEntity)

           const entity = MealAttendanceMapper.toEntity(row);
           return MealAttendanceMapper.toResponseDto(entity);
              
     }

    async update_meal_attendance(data: updateMealAttendanceSchemaDto, id: string, userId: string): Promise<mealAttendanceResponseSchemaDto> {
             if(!id){
                 throw new BadRequestError("Meal Attendance id is required")
             }
             if(!userId){
                 throw new BadRequestError("UserId is required")
             }
             if(!data){
                 throw new BadRequestError("Invalid fields value")
             }

             const exiting = await this.repository.fetch_meal_attendance_by_id(id);
             if(!exiting || !exiting.id){
                 throw new NotFoundError("Meal Attendance not found")
             }
             
             if(exiting.user_id !== userId){
                throw new UnauthorizedError("Unauthorized user")
             }

               // ✅ 3. Convert to entity
               const entity = MealAttendanceMapper.toEntity(exiting);

               if(entity.isConsumed && data.isConsumed===false){
                      throw new BadRequestError("Cannot revert consumed meal")
               }

               // ✅ Update isConsumed (QR scan case)
               if(data.isConsumed !== undefined){
                    entity.isConsumed = data.isConsumed;

                    if(data.isConsumed === true){
                        entity.scannedAt = new Date();
                        entity.scannedBy = userId   
                    }
               }

               if(data.scannedAt !== undefined){
                      entity.scannedAt = data.scannedAt;
               }

               if(data.scannedBy !== undefined){
                     entity.scannedBy = data.scannedBy
               }

               entity.updatedBy = userId;
               entity.updatedAt = new Date()

               const updatedRow = await this.repository.update_meal_attendance(entity,id);
               const updatedEntity = MealAttendanceMapper.toEntity(updatedRow);
               return MealAttendanceMapper.toResponseDto(updatedEntity);
     }

     async fetch_meal_attendance_by_id(id: string): Promise<mealAttendanceResponseSchemaDto | null> {
                  if(!id){
                      throw new BadRequestError("Meal Attendance id shouldn't be empty or null")
                  }

                  const  row = await this.repository.fetch_meal_attendance_by_id(id);
                  if(!row || !row.id){
                       throw  new NotFoundError(" Meal attandance not found")
                  }

                  const entity = MealAttendanceMapper.toEntity(row);
                  return MealAttendanceMapper.toResponseDto(entity);

     }

    async getByUserAndDateAndSlot(userId: string, attendanceDate: Date, slot: MealSlotEnumType): Promise<mealAttendanceResponseSchemaDto | null> {
            if (!userId) {
                    throw new BadRequestError("UserId is required");
               }

           if (!attendanceDate) {
                 throw new BadRequestError("attendanceDate is required");
                }

           if (!slot) {
                throw new BadRequestError("slot is required");
               }

        const row = await this.repository.getByUserAndDateAndSlot(userId,attendanceDate, slot)
        if(!row || !row.id){
            throw new NotFoundError("Not found")
        }

        const entity = MealAttendanceMapper.toEntity(row);
        return MealAttendanceMapper.toResponseDto(entity);
     }

     async getByUserId(userId: string): Promise<mealAttendanceResponseSchemaDto[]> {
             if(!userId){
                 throw new BadRequestError("UserId should not be empty or null")
             }

             const row = await this.repository.getByUserId(userId);
             if(!row || row.length===0){
                    return [];
             }

             const entity = MealAttendanceMapper.toEntityArray(row);
             return MealAttendanceMapper.toResponseDtoArray(entity);
     }

    async getByDateRange(startDate: Date, endDate: Date): Promise<mealAttendanceResponseSchemaDto[]> {
           if(!startDate){
                 throw new BadRequestError("startDate is required")
           }

           if(!endDate){
                 throw  new BadRequestError("endDate is required")
           }

           if(startDate > endDate){
                throw new BadRequestError("startDate cannot be greater than endDate");
           }

           const row = await this.repository.getByDateRange(startDate,endDate)
           if(!row || row.length==0){
                 return []
           }
           const entity = MealAttendanceMapper.toEntityArray(row);
           return MealAttendanceMapper.toResponseDtoArray(entity);
          }
}