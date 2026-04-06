import { MealSkipRow } from "@/config/models";
import { MealSkipEntity } from "../entity/meal_Skip.Entity";
import {  mealSlotEnumZodDto } from "../dtos/Meal_SkipDtos";

export interface IMealSkipRepository {
  // Create a new meal skip record
  create_mealSkip(entity: MealSkipEntity): Promise<MealSkipRow>;

  // Update existing meal skip (partial updates allowed)
  update_mealSkip(entity: MealSkipEntity, id:string): Promise<MealSkipRow>;

  // Get a single meal skip by ID
  getById(id: string): Promise<MealSkipRow | null>;

  // Get all skips for a user within a date range
  getByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<MealSkipRow[]>;

  // Get all skips for a subscription
  getBySubscription(subscriptionId: string): Promise<MealSkipRow[]>;

  // Check if user already skipped a slot on a particular date
  exists(userId: string, skipDate: Date, slot: mealSlotEnumZodDto): Promise<boolean>;

  // Delete a meal skip by ID
  deleteById(id: string): Promise<void>;
}