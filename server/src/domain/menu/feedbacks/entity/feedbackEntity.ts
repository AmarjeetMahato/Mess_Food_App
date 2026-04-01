

export class FeedbackEntity {
  constructor(
    public readonly id: string,
    public readonly user_id: string,
    public readonly daily_menu_id: string,
    public readonly menu_item_id: string,
    public readonly rating: number,
    public readonly comment: string | null,
    public readonly created_at: Date,
    public readonly updated_at: Date
  ) {}

  isPositive(): boolean {
    return this.rating >= 4;
  }
}