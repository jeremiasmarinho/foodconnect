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

  @IsString()
  imageUrls: string; // JSON string with array of URLs

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsString()
  establishmentId: string;
}

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @IsOptional()
  @IsString()
  imageUrls?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}

export class PostResponseDto {
  id: string;
  content: string;
  imageUrl: string | null; // Backwards compatibility
  imageUrls: string;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  restaurantId: string; // Backwards compatibility
  establishmentId: string;
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
    bio?: string | null;
  };
  restaurant: {
    id: string;
    name: string;
    city: string;
    state?: string | null;
    imageUrl: string | null;
    cuisine?: string | null;
    rating?: number | null;
  };
  establishment: {
    id: string;
    name: string;
    city: string;
    state?: string | null;
    imageUrl: string | null;
    type: string;
    rating?: number | null;
  };
  likes?: Array<{ id: string }>;
  comments?: Array<{
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      username: string;
      name: string;
      avatar: string | null;
    };
  }>;
  _count: {
    likes: number;
    comments: number;
  };
  // Computed fields
  isLikedByUser?: boolean;
  timeAgo?: string;
}
