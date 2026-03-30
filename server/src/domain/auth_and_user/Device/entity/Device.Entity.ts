
export class DeviceEntity{
     constructor(
          public readonly id : string,
          public readonly user_id : string,
          public readonly device_token: string,
          public readonly device_type : "mobile" | "tablet" | "desktop" | "unknown",
          public readonly platform:     'android' | 'ios' | 'web' | 'unknown',
          public readonly deviceName:   string | null,
          public readonly osVersion:    string | null,
          public readonly appVersion:   string | null,
          public readonly isTrusted:    boolean,
          public readonly isActive:     boolean,
          public readonly lastSeenAt:   Date,
          public readonly createdAt:    Date,
     ){}


       // ── Business behaviour ─────────────────────────────────────────────
     
       isAndroid():boolean{
         return this.platform==="android"
       }


        isIos(): boolean {
        return this.platform === 'ios';
       }
 
        isWeb(): boolean {
           return this.platform === 'web';
        }
 
       isMobile(): boolean {
        return this.device_type === 'mobile';
       }

       isStale(thresholdMinutes: number = 30): boolean {
         // true = device hasn't pinged in thresholdMinutes
         // used to detect agents who went offline without logging out
           const now     = new Date();
           const diffMs  = now.getTime() - this.lastSeenAt.getTime();
           const diffMin = diffMs / (1000 * 60);
           return diffMin > thresholdMinutes;
        }

        canReceivePushNotification():boolean{
          return this.isActive && this.device_token.length > 0
        }

        skipTwoFactor():boolean{
          return this.isTrusted && this.isActive
        }
}