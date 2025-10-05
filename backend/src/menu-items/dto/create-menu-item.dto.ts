import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateMenuItemDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsString()
  category: string; // appetizer, main, dessert, beverage

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @IsString()
  restaurantId: string;
}
