import { TOKENS } from "@/helper/user_and_auth/token";
import { inject, injectable } from "tsyringe";
import { NextFunction, Request,Response} from "express";
import { RegisterSchema } from "../dtos/AuthDtos";
import {type IAuthService } from "../services/IAuth.Service";


@injectable()
export class AuthController{

      constructor(@inject(TOKENS.AuthService) private service:IAuthService){}

      createUser = async(req:Request, res:Response, next:NextFunction):Promise<void>=> {
                                const dto = RegisterSchema.parse(req.body);
                      try {
                       await this.service.register(dto, req.ip,req.headers['user-agent']);
                           // Controller owns the response — it knows the HTTP context
                           // 204 no content with message — user created, pending verification
                            const message = dto.email
                             ? `A verification email has been sent to ${dto.email}. Please check your inbox.`
                             : `An OTP has been sent to ${dto.phone}. Please verify your number.`;
 
                         res.status(204).json({
                              sucess:true,
                              message
                         })
                      } catch (error) {
                           console.log(error);
                           next(error)
                      }
      }

      verification = async(req:Request, res:Response, next:NextFunction):Promise<void> =>{
                  try {
                        
                  } catch (error) {
                         console.log(error);
                        next(error)  
                  }
      }
}