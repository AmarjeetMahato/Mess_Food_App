import { MealPlanTemplateRow } from "@/config/models";
import { CreateMealPlanTemplateDto, UpdateMealPlanTemplateDto } from "../dtos/MealPlanTemplate";


export interface IMealPlanTemplateRepository{
     
       createMealTemplate(dto: CreateMealPlanTemplateDto, adminId:string): Promise<MealPlanTemplateRow>;

       findById(id: string): Promise<MealPlanTemplateRow | null>;

       findByDayAndSlot(day_number: number, slot: string): Promise<MealPlanTemplateRow[]>;

         findAll(): Promise<MealPlanTemplateRow[]>;
      update(id: string, dto:UpdateMealPlanTemplateDto, adminId:string): Promise<MealPlanTemplateRow | null>;
       delete(id: string): Promise<number>;

}