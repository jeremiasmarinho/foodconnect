import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  restaurantId: string;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}

export class PostResponseDto {
  id: string;
  content: string;
  imageUrl?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  restaurantId: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
  restaurant: {
    id: string;
    name: string;
    city: string;
    imageUrl?: string;
  };
  _count: {
    likes: number;
    comments: number;
  };
}
