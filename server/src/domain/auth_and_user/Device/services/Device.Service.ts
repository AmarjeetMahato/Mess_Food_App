import { TOKENS } from "@/helper/user_and_auth/token";
import { injectable, inject } from "tsyringe";
import { DeviceRepository } from "../repository/Device.Repository";
import { IDeviceRepository } from "../repository/IDevice.Repository";
import { IDeviceService } from "./IDevice.Service";
import { UpsertDeviceDto, DeviceResponseDto, DeviceListResponseDto } from "../dtos/DeviceDtos";
import { BadRequestError, ForbiddenError, InternalServerError, NotFoundError } from "@/globalError/AppError";
import { DeviceMapper } from "../mapper/Device.Mapper";


@injectable()
export class DeviceService implements IDeviceService {
      constructor(@inject(TOKENS.DeviceRepository) private repo: DeviceRepository){}


      async upsertDevice(userId: string, dto: UpsertDeviceDto): Promise<DeviceResponseDto> {
              if(!userId){
                   throw new BadRequestError("UserId is required")
              }

             const row = await this.repo.upsertDevice({
                     user_id:      userId,
                     device_token: dto.device_token,
                     device_type:  dto.device_type  ?? 'unknown',
                     platform:     dto.platform     ?? 'unknown',
                     device_name:  dto.device_name  ?? null,
                     os_version:   dto.os_version   ?? null,
                     app_version:  dto.app_version  ?? null,
                    // is_trusted stays as-is on upsert — never reset trust on re-login
                   // is_active reactivated inside repository onConflictDoUpdate
              });

              if(!row?.id){
                   throw new InternalServerError("Failed to upsert Device");   
              }
                 // Mapper: DB row → response DTO
                  return DeviceMapper.rowToResponseDto(row);
      }

      async getDeviceById(deviceId: string, userId: string): Promise<DeviceResponseDto> {
            if(!deviceId || !userId){
                   throw new BadRequestError("deviceId and userId is requires");      
            }
            const device = await this.repo.findById(deviceId);
            if(!device){
                  throw new NotFoundError("Device not found");        
            }

             // Ownership check — user can only access their own devices
            if(device.user_id !== userId){
                   throw new ForbiddenError('You do not have permission to access this device');
                   
            }
             // Mapper: entity → response DTO
            return DeviceMapper.toResponseDto(device)
      }

        // ── Get all active devices for a user ──────────────────────────────
      async getUserDevices(userId: string): Promise<DeviceListResponseDto> {
             if(!userId){
                    throw new BadRequestError("User Id is required");    
             }
             const rows = await this.repo.findByUserId(userId)
             if(rows.length === 0){
                  throw new NotFoundError("No Device found with current user")
             }
             return DeviceMapper.toListResponseDto(rows)
      }

        // ── Trust a device ─────────────────────────────────────────────────
      async trustDevice(deviceId: string, userId: string): Promise<void> {
            if(!userId || !deviceId){
                 throw new BadRequestError("userId and deviceId i required");
            }

            const device = await this.repo.findById(deviceId);
             if (!device) {
               throw new NotFoundError('Device not found');
               }
 
          // Ownership check
          if (device.user_id !== userId) {
                   throw new ForbiddenError('You do not have permission to trust this device');
            }
 
          if (!device.isActive) {
              throw new ForbiddenError('Cannot trust an inactive device');
             }    
               // Business rule — already trusted, no-op
           if(device.skipTwoFactor()){
              return
           }  
           await this.repo.markTrusted(deviceId)
      }

      async deactivateDevice(deviceId: string, userId: string): Promise<void> {
            if(!userId || !deviceId){
                 throw new BadRequestError("userId and deviceId i required");
            }
            
            const device = await this.repo.findById(deviceId);

            if(!device){
                  throw new NotFoundError("Device not found"); 
            }

             // Ownership check
            if (device.user_id !== userId) {
                   throw new ForbiddenError('You do not have permission to remove this device');
                  }
 
             // Already inactive — no-op
             if (!device.isActive) {
                   return;
               }
 
             await this.repo.deactivate(deviceId);
      }


       // ── Deactivate all devices ─────────────────────────────────────────
  async deactivateAllDevices(userId: string): Promise<void> {
    await this.repo.deactivateAllForUser(userId);
  }
 
  // ── Refresh last seen ──────────────────────────────────────────────
  async refreshLastSeen(deviceId: string): Promise<void> {
    await this.repo.updateLastSeen(deviceId);
  }

     
}