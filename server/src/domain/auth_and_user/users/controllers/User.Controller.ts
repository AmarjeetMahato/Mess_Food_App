// src/modules/user/user.controller.ts

import { TOKENS } from "@/helper/user_and_auth/token";
import { injectable, inject } from "tsyringe";
import { GetUserSchema, ListUsersSchema, UpdateProfileSchema, UpdateUserStatusSchema, ChangePasswordSchema, DeleteAccountSchema } from "../dtos/UsersDto";
import type { IUserService } from "../services/IUser.Service";
import {Request, Response, NextFunction} from "express"

@injectable()
export class UserController {

  constructor(
    @inject(TOKENS.UserService) private readonly service: IUserService,
  ) {}

  // GET /api/v1/users/me
  // Get own profile
  getProfile = async (
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = ""  
      const result = await this.service.getProfile(userId);

      sendSuccess(res, result, 'Profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/users/:id  (admin only)
  // Get any user by ID
  getUserById = async (
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = GetUserSchema.parse(req.params);
      const result = await this.service.getUserById(id);

      sendSuccess(res, result, 'User fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/users  (admin only)
  // List all users with pagination + filters
  getAllUsers = async (
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto    = ListUsersSchema.parse(req.query);
      const result = await this.service.getAllUsers(dto);

      sendSuccess(res, result, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/users/me
  // Update own profile — name, avatar_url
  updateProfile = async (
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const dto    = UpdateProfileSchema.parse(req.body);
      const result = await this.service.updateProfile(req.user!.id, dto);

      sendSuccess(res, result, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/users/:id/status  (admin only)
  // Update user status — active / inactive / banned
  updateUserStatus = async (
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = GetUserSchema.parse(req.params);
      const dto    = UpdateUserStatusSchema.parse(req.body);
      const result = await this.service.updateUserStatus(
        id,
        dto,
        req.user!.id,  // adminId — service checks cannot ban yourself
      );

      sendSuccess(res, result, `User status updated to '${dto.status}'`);
    } catch (error) {
      next(error);
    }
  };

  // PATCH /api/v1/users/me/password
  // Change own password
  changePassword = async (
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = ""  
      const dto = ChangePasswordSchema.parse(req.body);
      await this.service.changePassword(userId, dto);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please login again.',
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/users/me
  // Delete own account — soft delete with password confirmation
  deleteAccount = async (
    req:  Request,
    res:  Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = ""  
      const dto = DeleteAccountSchema.parse(req.body);
      await this.service.deleteAccount(userId, dto);

      res.status(200).json({
        success: true,
        message: 'Your account has been deleted successfully.',
      });
    } catch (error) {
      next(error);
    }
  };
}