import { DeviceController } from "@/domain/auth_and_user/Device/controllers/Device.Controller";
import express from "express"
import { container } from "tsyringe";

const router = express.Router();

const deviceController = container.resolve(DeviceController)

router.post("/create",deviceController.upsertDevice)
router.get("/get_all_user_device", deviceController.getUserDevices)
router.get("/get_device_by_id/:id",deviceController.getDeviceById)
router.get("/trust_device", deviceController.trustDevice)
router.get("/deactivate_device",deviceController.deactivateDevice)


export default router;