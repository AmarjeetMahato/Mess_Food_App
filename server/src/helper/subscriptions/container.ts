import { container, Lifecycle } from "tsyringe";
import { TOKENS } from "./tokens";
import { MealAttendanceRepository } from "@/domain/subscription/meal-attendance/repository/Meal_Attendance.Repository";
import { MealAttendanceService } from "@/domain/subscription/meal-attendance/services/Meal_Attendance.Service";
import { MealAttendanceController } from "@/domain/subscription/meal-attendance/controllers/Meal_Attendance.Controller";
import { SubscriptionController } from "@/domain/subscription/subscriptions/controllers/Subscription.Controller";
import { SubscriptionRepository } from "@/domain/subscription/subscriptions/repository/Subscription.Repository";
import { SubscriptionService } from "@/domain/subscription/subscriptions/services/Subscritpion.Service";




// 👉 Helper (optional but clean)
const singleton = (token: symbol, useClass: any) => {
  container.register(token, { useClass }, { lifecycle: Lifecycle.Singleton });
};

const transient = (token: symbol, useClass: any) => {
  container.register(token, { useClass });
};

// ================= MEALATTENDANCE =================
singleton(TOKENS.MealAttendanceRepository,MealAttendanceRepository),
singleton(TOKENS.MealAttendanceService,MealAttendanceService),
transient(TOKENS.MealAttendanceController, MealAttendanceController)

// ================= SUBSCRIPTION =================
singleton(TOKENS.SubscriptionRepository,SubscriptionRepository),
singleton(TOKENS.SubscriptionService,SubscriptionService),
transient(TOKENS.SubscriptionController, SubscriptionController)

