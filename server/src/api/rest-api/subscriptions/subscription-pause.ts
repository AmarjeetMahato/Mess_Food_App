import { SubscriptionPauseController } from "@/domain/subscription/subscription-pause/controllers/Subscription_Pause.Controller";
import expres from "express";
import { container } from "tsyringe";


const router = expres.Router();


const subcriptionPauseController = container.resolve(SubscriptionPauseController);


router.post("/subscription-pause/create",subcriptionPauseController.createSubscriptionPause)
router.patch("/subscription-pause/:id/update", subcriptionPauseController.updatePause)



export default router