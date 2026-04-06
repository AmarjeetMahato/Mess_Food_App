import { v4 as uuidv4 } from 'uuid';

export class MealSkipEntity {
  constructor(
    public readonly id: string = uuidv4(),

    public readonly userId: string,
    public readonly subscriptionId: string,
    public readonly dailyMenuId: string,

    public readonly slot: 'breakfast' | 'lunch' | 'snacks' | 'dinner',
    public readonly skipDate: Date,

    public reason: string | null = null,
    public walletCreditAmount: number = 0,
    public isWalletCredited: boolean = false,

    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // ----------------------
  // Business Logic Examples
  // ----------------------

  // Mark this skip as credited in wallet
  markWalletCredited(amount: number) {
    if (this.isWalletCredited) {
      throw new Error('Wallet already credited for this skip');
    }
    this.walletCreditAmount = amount;
    this.isWalletCredited = true;
    this.updatedAt = new Date();
  }

  // Check if skip is for today
  isSkipForToday(): boolean {
    const today = new Date();
    return (
      this.skipDate.getFullYear() === today.getFullYear() &&
      this.skipDate.getMonth() === today.getMonth() &&
      this.skipDate.getDate() === today.getDate()
    );
  }


}