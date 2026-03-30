import {injectable, inject} from "tsyringe"
import {Response, Request, NextFunction} from "express"
import { TOKENS } from "@/helper/user_and_auth/token"
import {type IDeviceService } from "../services/IDevice.Service"
import {DeactivateDeviceSchema, GetDeviceSchema, UpdateDeviceTrustSchema, UpsertDeviceSchema} from  "../dtos/DeviceDtos"
import { HTTPSTATUS } from "@/core/https.config"

@injectable()
export class DeviceController{

    constructor(@inject(TOKENS.DeviceService) private readonly service:IDeviceService){}

   upsertDevice = async (req:Request, res:Response, next:NextFunction) : Promise<void> => {
                  const body = UpsertDeviceSchema.safeParse(req.body)
                  if(!body.success){
                       res.status(HTTPSTATUS.BAD_REQUEST).json({
                            success:false,
                            message:"Invalid fields"
                       })
                       return;
                  }
                  const userId = ""
    try {
             const result = await this.service.upsertDevice(userId, body.data)
             res.status(HTTPSTATUS.CREATED).json({
                    success:true,
                    message:"Device upsert successfully!",
                    data: result
             })
                } catch (error) {
                  console.log(error);
                  next(error)     
    }
   }

    // GET /api/v1/devices
  // Get all active devices for the logged-in user
  getUserDevices = async (req:  Request,res:  Response,next: NextFunction,): Promise<void> => {
              const userId = "" 
    try { 
      const result = await this.service.getUserDevices(userId);
      res.status(HTTPSTATUS.OK).json({
        success:true,
        message:"Devices fetched successfully",
        data:result
        });
    } catch (error) {
      next(error);
    }
  };
 
  // GET /api/v1/devices/:id
  // Get a single device by ID — must belong to logged-in user
  getDeviceById = async ( req:  Request,res:  Response, next: NextFunction,): Promise<void> => {
    try {
      const { id } = GetDeviceSchema.parse(req.params);
      const userId = "req.userId;"

      const result = await this.service.getDeviceById(id,userId);
      res.status(HTTPSTATUS.OK).json({
           success:true,
           message:"Device fetched successfully",
           data:result
      })
    } catch (error) {
      next(error);
    }
  };
 
  // PATCH /api/v1/devices/trust
  // Mark a device as trusted — skips 2FA on next login
  trustDevice = async (req:  Request,res:  Response,next: NextFunction,): Promise<void> => {
    try {
      const { device_id } = UpdateDeviceTrustSchema.parse(req.body);
      const userId = "";
      await this.service.trustDevice(device_id,userId);
      res.status(200).json({
        success: true,
        message: 'Device marked as trusted. 2FA will be skipped on next login.',
      });
    } catch (error) {
      next(error);
    }
  };
 
  // DELETE /api/v1/devices/:id
  // Remove a single device — logs out from that device
  deactivateDevice = async (req:  Request,res:  Response,next: NextFunction,): Promise<void> => {
    try {
      const { device_id } = DeactivateDeviceSchema.parse(req.body);
      const userId = ""
      await this.service.deactivateDevice(device_id,userId);
 
      res.status(200).json({
        success: true,
        message: 'Device removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };
 
  // DELETE /api/v1/devices
  // Remove ALL devices — full logout from every device
  deactivateAllDevices = async (req:  Request,res:  Response,next: NextFunction): Promise<void> => {
    try {
      const userId = ""  
      await this.service.deactivateAllDevices(userId);
 
      res.status(200).json({
        success: true,
        message: 'All devices removed. You have been logged out from all devices.',
      });
    } catch (error) {
      next(error);
    }
  };
    
}