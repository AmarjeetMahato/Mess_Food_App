import { SubscriptionController } from "@/domain/subscription/subscriptions/controllers/Subscription.Controller";
import express from "express";
import { container } from "tsyringe";

const router = express.Router();

const subscriptionController =  container.resolve(SubscriptionController);

router.post("/subcription/create",subscriptionController.createSubscription);
router.patch("/subcription/:id/update",subscriptionController.updateSubscription);
router.get("/subcription/:id", subscriptionController.getSubscriptionById)
router.get("/subcription/active_subscriptions", subscriptionController.getActiveSubscriptionByUserId)
router.get("/subcription/by_userId",subscriptionController.getSubscriptionsByUserId)
router.get("/subcription/:id/cancle", subscriptionController.cancelSubscription)
router.get("/subcription/:id/pause", subscriptionController.pauseSubscription)
router.get("/subcription/:id/resume",subscriptionController.resumeSubscription)



export default router;