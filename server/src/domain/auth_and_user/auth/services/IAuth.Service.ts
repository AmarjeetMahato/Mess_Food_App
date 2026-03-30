import { RegisterDto, AuthResponseDto } from "../dtos/AuthDtos";


export interface IAuthService {
    
  register(dto:RegisterDto,ip?:string,userAgent?: string,): Promise<AuthResponseDto>;
}
 