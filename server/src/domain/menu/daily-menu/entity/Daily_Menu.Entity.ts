// src/modules/menu/daily-menu.entity.ts

import { MenuItemEntity } from "../../menu-item/entity/Menu.Entity";


export class DailyMenuEntity {
  constructor(
    public readonly id:        string,
    public readonly menuDate:  Date ,
    public readonly slot:      'breakfast' | 'lunch' | 'snacks' | 'dinner',
    public readonly isActive:  boolean,
    public readonly createdBy: string | null,
    public readonly items:     MenuItemEntity[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isToday(): boolean {
    const today = new Date();
    return (
      this.menuDate.getFullYear() === today.getFullYear() &&
      this.menuDate.getMonth()    === today.getMonth()    &&
      this.menuDate.getDate()     === today.getDate()
    );
  }

  is_Active(): boolean {
    return this.isActive;
  }

  isPast(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.menuDate < today;
  }

  isFuture(): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.menuDate > today;
  }

  hasItems(): boolean {
    return this.items.length > 0;
  }

  hasVegOptions(): boolean {
    return this.items.some((item) => item.isVeg());
  }

  hasNonVegOptions(): boolean {
    return this.items.some((item) => item.isNonVeg());
  }

  availableItems(): MenuItemEntity[] {
    return this.items.filter((item) => item.canBeServed());
  }

  canBeSkipped(): boolean {
    // Can only skip future or today's meals — not past ones
    return this.isActive && !this.isPast();
  }
}