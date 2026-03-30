
export const  TOKENS ={

     DB: Symbol("DB"),


    //Auth 
    AuthController:Symbol("AuthController"),
    AuthService:Symbol("AuthService"),
    AuthMapper:Symbol("AuthMapper"),
    AuthEntity:Symbol("AuthEntity"),
    AuthRepository:Symbol("AuthRepository"),

    // Device
    DeviceController:Symbol("DeviceController"),
    DeviceService:Symbol("DeviceService"),
    DeviceRepository:Symbol("DeviceRepository"),
    DeviceMapper:Symbol("DeviceMapper"),
    DeviceEntity:Symbol("DeviceEntity"),


//    Role
    RoleController:Symbol("RoleController"),
    RoleService:Symbol("RoleService"),
    RoleRepository: Symbol("RoleRepository"),
    RoleMapper:Symbol("RoleMapper"),
    RoleEntity: Symbol("RoleEntity"),

    // Session
    SessionMapper:Symbol("SessionMapper"),
    SessionService:Symbol("SessionService"),
    SessionController:Symbol("SessionController"),
    SessionRepository:Symbol("SessionRepository"),
    SessionEntity:Symbol("SessionEntity"),

    // Users
    UserController:Symbol("UserController"),
    UserEntity:Symbol("UserEntity"),
    UserRepository:Symbol("UserRepository"),
    UserService: Symbol("UserService"),
    UserMapper: Symbol("UserMapper"),


    // OTP_token
    OtpMapper:Symbol("OtpMapper"),
    OtpController:Symbol("OtpController"),
    OtpService:Symbol("OtpService"),
    OtpRepository:Symbol("OtpRepository"),
    OtpEntity:Symbol("OtpEntity"),


    // OauthToken
    OauthAccountController: Symbol("OauthAccountController"),
    OauthAccountEntity: Symbol("OauthAccountEntity"),
    OauthAccountMapper:Symbol("OauthAccountMapper"),
    OauthAccountService: Symbol("OauthAccountService"),
    OauthAccountRepository: Symbol("OauthAccountRepository")


}
