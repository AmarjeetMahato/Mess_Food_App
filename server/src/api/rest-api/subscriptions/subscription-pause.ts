import { SubscriptionPauseController } from "@/domain/subscription/subscription-pause/controllers/Subscription_Pause.Controller";
import expres from "express";
import { container } from "tsyringe";
import { validateRequest } from "@/utils/Zodvalidate";
import { createSubscriptionPauseSchema } from "@/domain/subscription/subscription-pause/dtos/Subscription_PauesDtos";


const router = expres.Router();


const subcriptionPauseController = container.resolve(SubscriptionPauseController);


router.post("/subscription-pause/create",validateRequest({
       body:createSubscriptionPauseSchema
}), subcriptionPauseController.createSubscriptionPause)

router.patch("/subscription-pause/:id/update",validateRequest({
       body:createSubscriptionPauseSchema,
       params:createSubscriptionPauseSchema
}), subcriptionPauseController.updatePause);

router.get("/subscription-pause/:id",validateRequest({
      params:createSubscriptionPauseSchema
}),subcriptionPauseController.getPauseById)

router.get("/subscription-pause/get-by-userId", subcriptionPauseController.getPausesByUserId);

router.get("/subscription-pause/get-by-subscriptionId", subcriptionPauseController.getPausesBySubscriptionId)

router.get("/subscription-pause/:id/get-active-by-subscriptionId",validateRequest({
      params:createSubscriptionPauseSchema
}), subcriptionPauseController.getActivePauseBySubscriptionId)

export default router