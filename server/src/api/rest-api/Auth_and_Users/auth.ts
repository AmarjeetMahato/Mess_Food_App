import { AuthController } from "@/domain/auth_and_user/auth/controllers/Auth.Controller";
import express from "express"
import { container } from "tsyringe";

const router = express.Router();

const authController = container.resolve(AuthController)

router.post("/create",authController.createUser)


export default router;