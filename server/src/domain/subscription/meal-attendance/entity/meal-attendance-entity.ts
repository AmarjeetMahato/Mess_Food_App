


export class MealAttendanceEntity {
  constructor(
    public readonly id: string,

    public readonly userId: string,
    public readonly subscriptionId: string,
    public readonly dailyMenuId: string,

    public readonly slot: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    public readonly attendanceDate: Date,

    public isConsumed: boolean,
    public scannedAt: Date | null,
    public scannedBy: string | null,

    public readonly createdBy: string | null,
    public updatedBy: string | null,

    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // 🔥 Domain Method (VERY IMPORTANT)
  markAsConsumed(scannedBy: string) {
    if (this.isConsumed) {
      throw new Error("Meal already consumed");
    }

    this.isConsumed = true;
    this.scannedAt = new Date();
    this.scannedBy = scannedBy;
  }
}