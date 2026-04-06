import { Request, Response,NextFunction } from "express";
import { TOKENS } from "@/helper/subscriptions/tokens";
import {injectable, inject} from "tsyringe"
import type { IMealAttendanceService } from "../services/IMeal_Attendance.Service";
import { createMealAttendanceSchema, createMealAttendanceSchemaParams, mealSlotEnum, MealSlotEnumType, updateMealAttendanceSchema } from "../dtos/Meal_AttendanceDtos";
import { HTTPSTATUS } from "@/core/https.config";
import { success } from "zod";
import { BadRequestError } from "@/globalError/AppError";

@injectable()
export class MealAttendanceController{
    constructor(@inject(TOKENS.MealAttendanceService) private readonly service:IMealAttendanceService){}

    create_mealAttendance= async(req:Request,res:Response, next:NextFunction):Promise<void> =>{
              const payload  = createMealAttendanceSchema.safeParse(req.body);
              if(!payload.success){
                      const formateError = payload.error.issues.map((err)=>({
                            fields: err.path.join("."),
                            message: err.message
                       }))
                       res.status(HTTPSTATUS.BAD_REQUEST).json({
                               error:"Invalid request data",
                               success: false,
                               message:formateError
                         })
                                         return
              }
                              const userId = req.userId;
              try {
                    const result = await this.service.create_meal_attendence(payload.data!, userId!)
                    res.status(HTTPSTATUS.CREATED).json({
                           message:"Meal Attendance created successfully",
                           success:true,
                           data:result
                    })
              } catch (error) {
                console.log(error);
                next(error)
                
              }
    }

    update_mealAttendance = async (req:Request, res:Response, next:NextFunction) :Promise<void> => {
                       const mealId = createMealAttendanceSchemaParams.safeParse(req.params);
                        if(!mealId.success){
                               res.status(HTTPSTATUS.BAD_REQUEST).json({
                               error:"Invalid request data",
                               success: false,
                               message:mealId.error.issues
                         })
                            return 
                        }
                       const payload = updateMealAttendanceSchema.safeParse(req.body);
                       if(!payload.success){
                            const formateError = payload.error.issues.map((err)=>({
                            fields: err.path.join("."),
                            message: err.message
                       }))
                       res.status(HTTPSTATUS.BAD_REQUEST).json({
                               error:"Invalid request data",
                               success: false,
                               message:formateError
                         })
                            return      
                       }

                       const userId = req.userId;

                       try {
                              const result = await this.service.update_meal_attendance(payload.data!,mealId.data.id!, userId!)
                              res.status(HTTPSTATUS.OK).json({
                                   message:"upadte meal attendance successfully",
                                   success:true,
                                   data:result
                              })
                       } catch (error) {
                           console.log(error);
                           next(error);
                           
                       }
    }

    fetch_meal_attendance_by_id = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                          const mealId = createMealAttendanceSchemaParams.safeParse(req.params);
                        if(!mealId.success){
                               res.status(HTTPSTATUS.BAD_REQUEST).json({
                               error:"Invalid request data",
                               success: false,
                               message:mealId.error.issues
                         })
                            return 
                        }

                        try {
                           const result = await this.service.fetch_meal_attendance_by_id(mealId.data.id!)
                          res.status(HTTPSTATUS.CREATED).json({
                                 message:"Meal Attendance fetch successfully",
                                 success:true,
                                data:result
                    })
                        } catch (error) {
                                console.log(error);
                           next(error);
                        }
    }

  fetchByUserId  = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                           
                       const userId = req.userId;

                       try {
                              const result = await this.service.getByUserId(userId!)
                              res.status(HTTPSTATUS.OK).json({
                                   message:" meal attendance fetch successfully",
                                   success:true,
                                   data:result
                              })
                       } catch (error) {
                           console.log(error);
                           next(error);
                           
                       }
  }

  getByUserAndDateAndSlot = async (req:Request, res:Response, next:NextFunction) :Promise<void> => {
             
                const { userId, attendanceDate, slot } = req.query;

                  if (!userId || typeof userId !== "string") {
        throw new BadRequestError("userId is required and must be a string");
      }

      if (!attendanceDate || typeof attendanceDate !== "string") {
        throw new BadRequestError("attendanceDate is required and must be a valid date string");
      }

      if (!slot || !mealSlotEnum.options.includes(slot as MealSlotEnumType)) {
        throw new BadRequestError(`slot is required and must be one of: ${mealSlotEnum.options.join(", ")}`);
      }
     
         const parsedDate = new Date(attendanceDate);
      if (isNaN(parsedDate.getTime())) {
        throw new BadRequestError("attendanceDate must be a valid date");
      }

      try {
              // ───────────── Call Service ─────────────
      const attendance = await this.service.getByUserAndDateAndSlot(userId, parsedDate,slot as MealSlotEnumType);
      res.status(HTTPSTATUS.OK).json({
        success: true,
        message:"Attendance found",
        data: attendance,
      });
      } catch (error) {
           console.log(error);
           next(error);
           
      }
  }

  getByDateRange = async (req:Request, res:Response, next:NextFunction) :Promise<void> => {
           try {
                      const { startDate, endDate } = req.query;
                      if (!startDate || typeof startDate !== "string") {
                               throw new BadRequestError("startDate is required and must be a valid date string");
                         }

                      if (!endDate || typeof endDate !== "string") {
                          throw new BadRequestError("endDate is required and must be a valid date string");
                         }

                    const start = new Date(startDate);
                    const end = new Date(endDate);

                    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                          throw new BadRequestError("startDate and endDate must be valid dates");
                          }
                    
                          const result = await this.service.getByDateRange(start,end);
                          res.status(HTTPSTATUS.OK).json({
                                message:"Attendance records found",
                                success:true,
                                data:result
                          })
               
           }catch(error){
                console.log(error);
                next(error);   
           }
  }
}