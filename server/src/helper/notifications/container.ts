import { container, Lifecycle } from "tsyringe";
import { TOKENS } from "./tokens";
import { NotificationRepository } from "@/domain/notifications/repository/Notification.Repository";
import { NotificationService } from "@/domain/notifications/services/Notification.Service";
import { NotificationController } from "@/domain/notifications/controllers/Notificaltion.Controller";





// 👉 Helper (optional but clean)
const singleton = (token: symbol, useClass: any) => {
  container.register(token, { useClass }, { lifecycle: Lifecycle.Singleton });
};

const transient = (token: symbol, useClass: any) => {
  container.register(token, { useClass });
};

// =============  NOTIFICATION ====================
singleton(TOKENS.NotificationRepository,NotificationRepository),
singleton(TOKENS.NotificationService,NotificationService),
transient(TOKENS.NotificationController, NotificationController)




