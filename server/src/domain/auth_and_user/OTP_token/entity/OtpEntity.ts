import th from "zod/v4/locales/th.js";

export class OtpEntity{
       constructor(
            public readonly id : string,
            public readonly userId : string | null,
            public readonly identifier : string,
            public readonly tokenHash: string,
            public readonly purpose:         string,
            public readonly channel:         string,
            public readonly attempts:        number,
            public readonly isUsed:          boolean,
            public readonly expiresAt:       Date,
            public readonly usedAt:          Date | null,
            public readonly lastRequestedAt: Date | null,
            public readonly createdAt:       Date,
       ){}
   
       isExpired():boolean{
              return this.isExpired()
       } 

       isAlreadyUsed():boolean{
              return this.isAlreadyUsed()
       }

       hasExceededMaxAttempts(maxAttempts: number = 5): boolean {
               return this.attempts >= maxAttempts;
       }
 
     isValid(): boolean {
      // OTP is valid only if — not expired, not used, attempts not exceeded
        return (
          !this.isExpired()              &&
          !this.isAlreadyUsed()          &&
          !this.hasExceededMaxAttempts()
         );
  }
 
  secondsUntilExpiry(): number {
    const diffMs = this.expiresAt.getTime() - new Date().getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
  }
 
  secondsUntilResendAllowed(cooldownSeconds: number = 60): number {
    // How long the user must wait before requesting a new OTP
    if (!this.lastRequestedAt) return 0;
 
    const elapsedMs  = new Date().getTime() - this.lastRequestedAt.getTime();
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const remaining  = cooldownSeconds - elapsedSec;
 
    return Math.max(0, remaining);
  }
 
  isCooldownActive(cooldownSeconds: number = 60): boolean {
    return this.secondsUntilResendAllowed(cooldownSeconds) > 0;
  }
 
  remainingAttempts(maxAttempts: number = 5): number {
    return Math.max(0, maxAttempts - this.attempts);
  }
   
       
}