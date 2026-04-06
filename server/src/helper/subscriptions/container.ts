import { container, Lifecycle } from "tsyringe";
import { TOKENS } from "./tokens";
import { MealAttendanceRepository } from "@/domain/subscription/meal-attendance/repository/Meal_Attendance.Repository";
import { MealAttendanceService } from "@/domain/subscription/meal-attendance/services/Meal_Attendance.Service";
import { MealAttendanceController } from "@/domain/subscription/meal-attendance/controllers/Meal_Attendance.Controller";
import { SubscriptionController } from "@/domain/subscription/subscriptions/controllers/Subscription.Controller";
import { SubscriptionRepository } from "@/domain/subscription/subscriptions/repository/Subscription.Repository";
import { SubscriptionService } from "@/domain/subscription/subscriptions/services/Subscritpion.Service";
import { SubscriptionPauseController } from "@/domain/subscription/subscription-pause/controllers/Subscription_Pause.Controller";
import { SubscriptionPauseService } from "@/domain/subscription/subscription-pause/services/Subscription_Pause.Service";
import { SubscriptionPauserRepository } from "@/domain/subscription/subscription-pause/repository/Subscription_Pause.Repository";
import { MealSkipRepository } from "@/domain/subscription/meal-skip/repository/Meal_Skip.Repository";
import { MealSkipService } from "@/domain/subscription/meal-skip/services/Meal_Skip.Service";
import { MealSkipController } from "@/domain/subscription/meal-skip/controllers/Meal_Skip.Controller";




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
transient(TOKENS.SubscriptionController, SubscriptionController);

// ================= SUBSCRIPTION_PAUSE =================
singleton(TOKENS.SubscriptionPauserRepository,SubscriptionPauserRepository);
singleton(TOKENS.SubscriptionPauseService,SubscriptionPauseService);
transient(TOKENS.SubscriptionPauseController, SubscriptionPauseController);


// ================= MEAL_SKIP =================
singleton(TOKENS.MealSkipRepository,MealSkipRepository);
singleton(TOKENS.MealSkipService,MealSkipService);
transient(TOKENS.MealSkipController, MealSkipController);



