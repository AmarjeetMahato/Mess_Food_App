
import { TOKENS } from "@/helper/user_and_auth/token";
import { inject, injectable } from "tsyringe";
import { AuthRepository } from "../repository/Auth.Repository";
import bcrypt from "bcryptjs"
import { AuthMapper } from "../mapper/Auth.Mapper";
import { RegisterDto, AuthResponseDto } from "../dtos/AuthDtos";
import { ConflictError, InternalServerError } from "@/globalError/AppError";
import { TokenUtil } from "@/utils/jwtTokens";
import { IAuthService } from "./IAuth.Service";


const BCRYPT_ROUNDS = 12

@injectable()
export class AuthService implements IAuthService{
     
     constructor(@inject(TOKENS.AuthService) private  repo:AuthRepository){}


    async register(dto:RegisterDto,ip?:string,userAgent?: string,): Promise<AuthResponseDto> {
 
    // ── Step 1: Check email uniqueness ────────────────────────────────
    if (dto.email) {
      const existing = await this.repo.findUserByEmail(dto.email);
      if (existing) {
        throw new ConflictError('An account with this email already exists');
      }
    }
 
    // ── Step 2: Check phone uniqueness ────────────────────────────────
    if (dto.phone) {
      const existing = await this.repo.findUserByPhone(dto.phone);
      if (existing) {
        throw new ConflictError('An account with this phone number already exists');
      }
    }
 
    // ── Step 3: Fetch default role ────────────────────────────────────
    const defaultRole = await this.repo.findDefaultRole();
    if (!defaultRole) {
      throw new InternalServerError(
        'Default user role not configured. Please contact support.',
      );
    }
 
    // ── Step 4: Hash password ─────────────────────────────────────────
    let passwordHash: string | null = null;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }
 
    // ── Step 5: Create user ───────────────────────────────────────────
    const newUser = await this.repo.createUser({
      name:              dto.name,
      email:             dto.email  ?? null,
      phone:             dto.phone  ?? null,
      password_hash:     passwordHash,
      role_id:           defaultRole.id,
      status:            'pending_verification',
      is_email_verified: false,
      is_phone_verified: false,
      avatar_url:        null,
    });
 
    // ── Step 6: Generate tokens ───────────────────────────────────────
    const { token: accessToken } = TokenUtil.generateAccessToken({
      sub:     newUser.id,
      role:    newUser.roleName,
      session: 'pending',
    });
 
    const { token: refreshToken } = TokenUtil.generateRefreshToken({
      sub:     newUser.id,
      session: 'pending',
    });
 
    const tokens = {
      access_token:  accessToken,
      refresh_token: refreshToken,
      token_type:    'Bearer' as const,
      expires_in:    TokenUtil.getAccessTokenExpiresIn(),
    };
 
    // ── Step 7: Map entity → response DTO ────────────────────────────
    // Mapper owns all transformations — password_hash never exposed
    return AuthMapper.toAuthResponse(newUser, tokens, null, true);
  }
}