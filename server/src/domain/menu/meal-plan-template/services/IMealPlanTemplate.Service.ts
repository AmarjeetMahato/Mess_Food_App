import { CreateMealPlanTemplateDto, MealPlanTemplateResponseDto, UpdateMealPlanTemplateDto } from "../dtos/MealPlanTemplate";


export interface IMealPlanTemplateService{
    

    findById(id: string): Promise<MealPlanTemplateResponseDto | null>;

    createMealTemplate(dto: CreateMealPlanTemplateDto, adminId:string): Promise<MealPlanTemplateResponseDto>;

    updateMealTemplate(id: string, dto: UpdateMealPlanTemplateDto, adminId:string): Promise<MealPlanTemplateResponseDto | null>;

     deleteMealTemplate(id: string): Promise<number>;
}