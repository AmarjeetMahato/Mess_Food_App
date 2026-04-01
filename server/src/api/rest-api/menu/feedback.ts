import { FeedbackController } from "@/domain/menu/feedbacks/controllers/feedbackController";
import express from "express";
import { container } from "tsyringe";


const router = express.Router();

const feedbackController = container.resolve(FeedbackController)

router.post("/feedback/create",feedbackController.create_feedback)
router.get("/feedback/:id", feedbackController.fetch_by_id)
router.get("/feedback/user_id",feedbackController.fetch_by_userId)
router.patch("/feedback/:id/update", feedbackController.update_feedback)

export default router;