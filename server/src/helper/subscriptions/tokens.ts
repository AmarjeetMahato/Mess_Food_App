
export const TOKENS = {
    // MealAttendance
    MealAttendanceRepository:Symbol("MealAttendanceRepository"),
    MealAttendanceService:Symbol("MealAttendanceService"),
    MealAttendanceController:Symbol("MealAttendanceController"),


    // Subscription
    SubscriptionRepository:Symbol("SubscriptionRepository"),
    SubscriptionController:Symbol("SubscriptionController"),
    SubscriptionService:Symbol("SubscriptionService"),

    // SubscriptionPause
    SubscriptionPauseController:Symbol("SubscriptionPauseController"),
    SubscriptionPauserRepository: Symbol("SubscriptionPauserRepository"),
    SubscriptionPauseService: Symbol("SubscriptionPauseService"),
   
    // MealSkip
    MealSkipRepository:Symbol("MealSkipRepository"),
    MealSkipService:Symbol("MealSkipService"),
    MealSkipController: Symbol("MealSkipController")

}