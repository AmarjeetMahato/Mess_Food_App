
export class MealPlanEntity{

      constructor(
    public readonly id: string,
    public readonly day_number: number, // integer in DB → number here
    public readonly slot: 'breakfast' | 'lunch' | 'snacks' | 'dinner', // enum type
    public readonly menu_item_id: string,
    public readonly is_active: boolean = true,
    public readonly created_by: string = "",
    public readonly created_at: Date = new Date(),
    public readonly updated_at: Date = new Date(),
  ) {}

  is_Active(): boolean {
    return this.is_active;
  }


  // Optional helper: format slot nicely
  slotLabel(): string {
    return this.slot.charAt(0).toUpperCase() + this.slot.slice(1);
  }


}