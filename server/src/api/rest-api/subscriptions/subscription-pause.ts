import { SubscriptionPauseController } from "@/domain/subscription/subscription-pause/controllers/Subscription_Pause.Controller";
import expres from "express";
import { container } from "tsyringe";


const router = expres.Router();


const subcriptionPauseController = container.resolve(SubscriptionPauseController);


router.post("/subscription-pause/create",subcriptionPauseController.createSubscriptionPause)
router.patch("/subscription-pause/:id/update", subcriptionPauseController.updatePause)
router.get("/subscription-pause/:id", subcriptionPauseController.getPauseById)
router.get("/subscription-pause/get-by-userId", subcriptionPauseController.getPausesByUserId);
router.get("/subscription-pause/get-by-subscriptionId", subcriptionPauseController.getPausesBySubscriptionId)
router.get("/subscription-pause/:id/get-active-by-subscriptionId", subcriptionPauseController.getActivePauseBySubscriptionId)

export default router