import { ThreeDayMenuResponseDto } from "../../meal-plan-template/dtos/MealPlanTemplate";
import { DailyMenuResponseDto, CreateDailyMenuDto, UpdateDailyMenuDto, GetThreeDayMenuDto,
   ActiveOrDeactivateResponse } from "../dtos/DailyMenuDtos";


export interface IDailyMenuService {
 
  // ── Read ───────────────────────────────────────────────────────────
  getById(id: string): Promise<DailyMenuResponseDto>;
 
  getThreeDayMenu(dto: GetThreeDayMenuDto): Promise<ThreeDayMenuResponseDto[]>;
  // core feature — shows all slots for next 3 days
  // used by users to plan their meals + decide skips
 
  // ── Write (admin only) ────────────────────────────────────────────
  create(dto: CreateDailyMenuDto, adminId: string): Promise<DailyMenuResponseDto>;
  update(id: string, dto: UpdateDailyMenuDto, adminId: string): Promise<DailyMenuResponseDto>;
  deactivate(id: string, userId:string): Promise<ActiveOrDeactivateResponse>;
  activate(id: string, userId:string): Promise<ActiveOrDeactivateResponse>;

  deleteDailyMenu(id: string): Promise<void>;
}
 