import { MealSkipCreateSchemaDto, MealSkipResponseSchemaDto, MealSkipUpdateSchemaDto, mealSlotEnumZodDto } from "../dtos/Meal_SkipDtos";


export interface IMealSkipService{
      
        create_meal_skip(data:MealSkipCreateSchemaDto):Promise<MealSkipResponseSchemaDto>;

        update(id:string,data:MealSkipUpdateSchemaDto):Promise<MealSkipResponseSchemaDto>;

        getById(id: string): Promise<MealSkipResponseSchemaDto | null>;

  // ----------------------
  // GET BY USER + DATE RANGE
  // ----------------------
  getByUserAndDateRange(userId: string,startDate: Date,endDate: Date): Promise<MealSkipResponseSchemaDto[]>;

  // ----------------------
  // GET BY SUBSCRIPTION
  // ----------------------
  getBySubscription( subscriptionId: string): Promise<MealSkipResponseSchemaDto[]>;

  // ----------------------
  // CHECK EXISTS
  // ----------------------
  exists(userId: string,skipDate: Date,slot: mealSlotEnumZodDto): Promise<boolean>;

  // ----------------------
  // DELETE
  // ----------------------
  deleteById(id: string): Promise<void>;
}