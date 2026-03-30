// Auth
import { AuthController } from "@/domain/auth_and_user/auth/controllers/Auth.Controller";
import { AuthService } from "@/domain/auth_and_user/auth/services/Auth.Service";
import {AuthRepository} from "@/domain/auth_and_user/auth/repository/Auth.Repository";
import {AuthMapper} from "@/domain/auth_and_user/auth/mapper/Auth.Mapper";

// Device
import { DeviceRepository } from "@/domain/auth_and_user/Device/repository/Device.Repository";
import { DeviceService } from "@/domain/auth_and_user/Device/services/Device.Service";
import { DeviceController } from "@/domain/auth_and_user/Device/controllers/Device.Controller";
import { DeviceEntity } from "@/domain/auth_and_user/Device/entity/Device.Entity";
import { DeviceMapper } from "@/domain/auth_and_user/Device/mapper/Device.Mapper";

// Role
import { RoleController } from "@/domain/auth_and_user/role/controllers/Role.Controller";
import { RoleService } from "@/domain/auth_and_user/role/services/Role.Service";
import { RoleRepository } from "@/domain/auth_and_user/role/repository/Role.Repository";
import { RoleMapper } from "@/domain/auth_and_user/role/mapper/Role.Mapper";
import { RoleEntity } from "@/domain/auth_and_user/role/entity/Role.Entity";

// Session
import { SessionController } from "@/domain/auth_and_user/sessions/controllers/SessionController";
import { SessionRepository } from "@/domain/auth_and_user/sessions/repository/Session.Repository";
import { SessionService } from "@/domain/auth_and_user/sessions/services/Session.Service";
import {SessionEntity}  from "@/domain/auth_and_user/sessions/entity/Session.Entity";
import { SessionMapper } from "@/domain/auth_and_user/sessions/mapper/Session.Mapper";


// User
import { UserRepository } from "@/domain/auth_and_user/users/repository/User.Repository";
import { UserService } from "@/domain/auth_and_user/users/services/User.Service";
import { UserController } from "@/domain/auth_and_user/users/controllers/User.Controller";
import { UserMapper } from "@/domain/auth_and_user/users/mapper/User.Mapper";
import { UserEntity } from "@/domain/auth_and_user/users/entity/User.Entity";

// Otp
import { OtpController } from "@/domain/auth_and_user/OTP_token/controllers/Otp.Controllers";
import { OtpService } from "@/domain/auth_and_user/OTP_token/services/Otp.Service";
import { OtpMapper } from "@/domain/auth_and_user/OTP_token/mapper/Otp.Mapper";
import { OtpRepository } from "@/domain/auth_and_user/OTP_token/repository/Otp.Repository";
import { OtpEntity } from "@/domain/auth_and_user/OTP_token/entity/OtpEntity";


// OauthAccount
import { OauthAccountController } from "@/domain/auth_and_user/OauthAccount/controllers/OauthAccount.Controllers";
import { OauthAccountRepository } from "@/domain/auth_and_user/OauthAccount/repository/OauthAccountRepository";
import { OauthAccountEntity } from "@/domain/auth_and_user/OauthAccount/entity/OauthAccount.Entity";
import { OauthAccountMapper } from "@/domain/auth_and_user/OauthAccount/mapper/OauthAccount.Mapper";
import { OauthAccountService } from "@/domain/auth_and_user/OauthAccount/service/OauthAccount.Service";

// ================= REGISTER =================

import { container, Lifecycle } from "tsyringe";
import { TOKENS } from "./token";
import { db, DrizzleDb } from "@/config/database/database";

// 👉 Helper (optional but clean)
const singleton = (token: symbol, useClass: any) => {
  container.register(token, { useClass }, { lifecycle: Lifecycle.Singleton });
};

const transient = (token: symbol, useClass: any) => {
  container.register(token, { useClass });
};

// ==========================================
// 1. Database Connection (Static Value)
// ==========================================
container.register<DrizzleDb>(TOKENS.DB, { useValue: db });


// ================= AUTH =================
singleton(TOKENS.AuthRepository, AuthRepository);
singleton(TOKENS.AuthService, AuthService);
singleton(TOKENS.AuthMapper, AuthMapper);
transient(TOKENS.AuthController, AuthController);

// ================= DEVICE =================
singleton(TOKENS.DeviceRepository, DeviceRepository);
singleton(TOKENS.DeviceService, DeviceService);
singleton(TOKENS.DeviceMapper, DeviceMapper);
singleton(TOKENS.DeviceEntity, DeviceEntity);
transient(TOKENS.DeviceController, DeviceController);

// ================= ROLE =================
singleton(TOKENS.RoleRepository, RoleRepository);
singleton(TOKENS.RoleService, RoleService);
singleton(TOKENS.RoleMapper, RoleMapper);
singleton(TOKENS.RoleEntity, RoleEntity);
transient(TOKENS.RoleController, RoleController);

// ================= SESSION =================
singleton(TOKENS.SessionRepository, SessionRepository);
singleton(TOKENS.SessionService, SessionService);
singleton(TOKENS.SessionMapper, SessionMapper);
singleton(TOKENS.SessionEntity, SessionEntity);
transient(TOKENS.SessionController, SessionController);

// ================= USER =================
singleton(TOKENS.UserRepository, UserRepository);
singleton(TOKENS.UserService, UserService);
singleton(TOKENS.UserMapper, UserMapper);
singleton(TOKENS.UserEntity, UserEntity);
transient(TOKENS.UserController, UserController);

// ================= OTP =================
singleton(TOKENS.OtpRepository, OtpRepository);
singleton(TOKENS.OtpService, OtpService);
singleton(TOKENS.OtpMapper, OtpMapper);
singleton(TOKENS.OtpEntity, OtpEntity);
transient(TOKENS.OtpController, OtpController);

// ================= OAUTH =================
singleton(TOKENS.OauthAccountRepository, OauthAccountRepository);
singleton(TOKENS.OauthAccountService, OauthAccountService);
singleton(TOKENS.OauthAccountMapper, OauthAccountMapper);
singleton(TOKENS.OauthAccountEntity, OauthAccountEntity);
transient(TOKENS.OauthAccountController, OauthAccountController);

// ================= EXPORT =================
export { container };