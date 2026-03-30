// src/modules/auth_and_users/role.controller.ts

import { TOKENS } from "@/helper/user_and_auth/token";
import {Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { ListRolesSchema, GetRoleSchema, CreateRoleSchema, UpdateRoleSchema, AssignRoleSchema } from "../dtos/RoleDtos";
import type { IRoleService } from "../services/IRole.Service";
import { HTTPSTATUS } from "@/core/https.config";



@injectable()
export class RoleController {

  constructor(
    @inject(TOKENS.RoleService) private readonly service: IRoleService,
  ) {}

  // GET /api/v1/roles
  getAllRoles = async (req:  Request,res:  Response,next: NextFunction): Promise<void> => {
    try {
      const { is_active } = ListRolesSchema.parse(req.query);
      const result = await this.service.getAllRoles(is_active);
      res.status(HTTPSTATUS.OK).json({
           success:true,
           message:"Roles fetch successfully",
           data:result
      })
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/roles/:id
  getRoleById = async (req:  Request, res:  Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = GetRoleSchema.parse(req.params);
      const result = await this.service.getRoleById(id);
       res.status(HTTPSTATUS.OK).json({
           success:true,
           message:"Role fetch successfully",
           data:result
      })
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/roles
  createRole = async (req:Request,res:  Response, next: NextFunction): Promise<void> => {
    try {
      const dto    = CreateRoleSchema.parse(req.body);
      const result = await this.service.createRole(dto);

      res.status(201).json({
        success: true,
        data:    result,
        message: `Role '${result.name}' created successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/roles/:id
  updateRole = async (req:  Request, res:  Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = GetRoleSchema.parse(req.params);
      const dto    = UpdateRoleSchema.parse(req.body);
      const result = await this.service.updateRole(id, dto);
      res.status(201).json({
        success: true,
        data:    result,
        message: `Role '${result.name}' created successfully`,
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/roles/:id/activate
  activateRole = async (req:Request,res:  Response,next: NextFunction): Promise<void> => {
    try {
      const { id } = GetRoleSchema.parse(req.params);
      await this.service.activateRole(id);

      res.status(200).json({
        success: true,
        message: 'Role activated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/roles/:id/deactivate
  deactivateRole = async (req:  Request,res:  Response,next: NextFunction): Promise<void> => {
    try {
      const { id } = GetRoleSchema.parse(req.params);
      await this.service.deactivateRole(id);

      res.status(200).json({
        success: true,
        message: 'Role deactivated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/roles/assign
  assignRoleToUser = async (req:  Request, res:  Response, next: NextFunction): Promise<void> => {
    try {
      const dto = AssignRoleSchema.parse(req.body);
      await this.service.assignRoleToUser(dto);

      res.status(200).json({
        success: true,
        message: 'Role assigned to user successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}