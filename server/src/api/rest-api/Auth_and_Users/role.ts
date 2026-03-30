import { RoleController } from "@/domain/auth_and_user/role/controllers/Role.Controller";
import express from "express"
import { container } from "tsyringe";


const router = express.Router();

const roleController = container.resolve(RoleController)

router.post("/create", roleController.createRole)
router.get("/:id/activate",roleController.activateRole)
router.get("/get_all_roles",roleController.getAllRoles)
router.get("/:id/get_role", roleController.getRoleById)
router.post("/assign", roleController.assignRoleToUser)
router.patch("/:id/update_role", roleController.updateRole)

export default router;