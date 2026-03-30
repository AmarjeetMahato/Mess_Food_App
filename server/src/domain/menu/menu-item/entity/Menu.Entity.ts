// src/modules/menu/menu-item.entity.ts
 
export class MenuItemEntity {
  constructor(
    public readonly id:          string,
    public readonly name:        string,
    public readonly description: string | null,
    public readonly category:    'veg' | 'non_veg' | 'egg',
    public readonly imageUrl:    string | null,
    public readonly isAvailable: boolean,
    public readonly createdAt:   Date,
    public readonly updatedAt:   Date,
  ) {}
 
  isVeg():    boolean { return this.category === 'veg'; }
  isNonVeg(): boolean { return this.category === 'non_veg'; }
  isEgg():    boolean { return this.category === 'egg'; }
  hasImage(): boolean { return this.imageUrl !== null; }
 
  canBeServed(): boolean {
    return this.isAvailable;
  }
}
 