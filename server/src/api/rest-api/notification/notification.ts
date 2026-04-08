import { NotificationController } from "@/domain/notifications/controllers/Notificaltion.Controller";
import { createNotificationSchema, notificationParamsSchema, updateNotificationSchema } from "@/domain/notifications/dtos/NotificationDtos";
import { validateRequest } from "@/utils/Zodvalidate";
import express from "express";
import { container } from "tsyringe";


const router = express.Router();

const notificationController = container.resolve(NotificationController);

router.post("/notification/create", validateRequest({
        body:createNotificationSchema
}), notificationController.create_notification);

router.post("/notification/bulk_creation", notificationController.createBulk_notifications);

router.patch("/notification/:id/update", validateRequest({
       params:notificationParamsSchema,
       body:updateNotificationSchema
}), notificationController.update_notification);

router.get("/notification/get_notification/:id", validateRequest({
    params:notificationParamsSchema
}),notificationController.fetch_notification_by_Id);

router.get("/notification/get_by_userId", notificationController.fetch_notification_by_userId)

router.get("/notification/:id/markasread",validateRequest({
    params:notificationParamsSchema
}), notificationController.markAsRead)

router.get("/notification/markAllAsRead", validateRequest({
   params:notificationParamsSchema
}), notificationController.markAllAsRead);

router.get("/notification/getUnreadCount", notificationController.getUnreadCount);








export default router;