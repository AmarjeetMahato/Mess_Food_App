import { TOKENS } from "@/helper/menu/token";
import {injectable, inject} from "tsyringe"
import type { IMealPlanTemplateRepository } from "../repository/IMealPlanTemplate.Repository";
import { IMealPlanTemplateService } from "./IMealPlanTemplate.Service";
import { CreateMealPlanTemplateDto, MealPlanTemplateResponseDto, UpdateMealPlanTemplateDto } from "../dtos/MealPlanTemplate";
import { BadRequestError, InternalServerError, NotFoundError } from "@/globalError/AppError";
import { MealPLanTemplateMapper } from "../mapper/MealPlanTemplate.Mapper";
import { MealPlanTemplate } from "@/config/models";


@injectable()
export class MealPlanTemplateService implements IMealPlanTemplateService{
    constructor(@inject(TOKENS.MealPlanTemplateRepository) private mealPlanTemplateRepository: IMealPlanTemplateRepository){}
     

    async createMealTemplate(dto: CreateMealPlanTemplateDto, adminId: string): Promise<MealPlanTemplateResponseDto> {
          if(!adminId){
                throw new BadRequestError("Admin ID must be provided");
          }

          const createdTemplate =  await this.mealPlanTemplateRepository.createMealTemplate(dto, adminId);
          if(!createdTemplate){
                throw new InternalServerError("Failed to create meal plan template");
          }

            // ✅ 2. Row → Entity
          const entity = MealPLanTemplateMapper.toDomain(createdTemplate);

          return MealPLanTemplateMapper.toResponseDto(entity);
    }


   async  findById(id: string): Promise<MealPlanTemplateResponseDto | null> {
         if(!id){
              throw new BadRequestError("ID must be provided");
         }

         const row = await this.mealPlanTemplateRepository.findById(id);
         if(!row){
                throw new NotFoundError("Meal plan template not found");
         }

         const template =  MealPLanTemplateMapper.toDomain(row)

         return MealPLanTemplateMapper.toResponseDto(template);
    }

     async updateMealTemplate(id: string, dto: UpdateMealPlanTemplateDto, adminId: string): Promise<MealPlanTemplateResponseDto | null> {
                if(!id){
                      throw new BadRequestError("ID must be provided");
                }
                  if(!adminId){
                          throw new BadRequestError("Admin ID must be provided");
                  }

                  const existing = await this.mealPlanTemplateRepository.findById(id);
                  if(!existing){
                        throw new NotFoundError("Meal plan template not found");
                  }

                  const  template = MealPLanTemplateMapper.toDomain(existing);

                  if(!template.is_Active()){
                        throw new BadRequestError("Cannot update an inactive meal plan template");
                  }

                  const updatedRow = await this.mealPlanTemplateRepository.update(id, dto, adminId);
                  if(!updatedRow){
                        throw new InternalServerError("Failed to update meal plan template");
                  }
                  return MealPLanTemplateMapper.toResponseDto(MealPLanTemplateMapper.toDomain(updatedRow));

      }

      async deleteMealTemplate(id: string): Promise<number> {
             if(!id){
                    throw new BadRequestError("ID must be provided");
             }
                  const existing = await this.mealPlanTemplateRepository.findById(id);
                  if(!existing){
                        throw new NotFoundError("Meal plan template not found");
                  }
                  
                  return await this.mealPlanTemplateRepository.delete(id);
      }



}