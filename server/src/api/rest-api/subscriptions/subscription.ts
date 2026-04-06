import { SubscriptionController } from "@/domain/subscription/subscriptions/controllers/Subscription.Controller";
import { createSubscriptionSchema, createSubscriptionParamsSchema } from "@/domain/subscription/subscriptions/dtos/subscriptionDtos";
import { validateRequest } from "@/utils/Zodvalidate";
import express from "express";
import { container } from "tsyringe";

const router = express.Router();

const subscriptionController =  container.resolve(SubscriptionController);

router.post("/subcription/create",validateRequest({
      body:createSubscriptionSchema
}),subscriptionController.createSubscription);

router.patch("/subcription/:id/update",validateRequest({
      body:createSubscriptionSchema,
      params:createSubscriptionParamsSchema
}),subscriptionController.updateSubscription);


router.get("/subcription/:id",validateRequest({
      params:createSubscriptionParamsSchema
}), subscriptionController.getSubscriptionById)

router.get("/subcription/active_subscriptions", subscriptionController.getActiveSubscriptionByUserId)

router.get("/subcription/by_userId",subscriptionController.getSubscriptionsByUserId)

router.get("/subcription/:id/cancle",validateRequest({
      params:createSubscriptionParamsSchema
}), subscriptionController.cancelSubscription)

router.get("/subcription/:id/pause",validateRequest({
      params:createSubscriptionParamsSchema
}), subscriptionController.pauseSubscription)

router.get("/subcription/:id/resume",validateRequest({
      params:createSubscriptionParamsSchema
}),subscriptionController.resumeSubscription)


export default router;