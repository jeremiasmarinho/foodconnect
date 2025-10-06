import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class FeedFilterDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  cuisine?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  city?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  state?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minLikes?: number;

  @IsOptional()
  @IsString()
  timeFilter?: 'today' | 'week' | 'month' | 'all';

  @IsOptional()
  @IsString()
  declare sortBy?: 'createdAt' | 'likes' | 'comments' | 'rating';

  @IsOptional()
  @IsString()
  declare sortOrder?: 'asc' | 'desc';
}

export interface FeedStats {
  totalPosts: number;
  totalRestaurants: number;
  totalCuisines: number;
  avgRating: number;
  topCuisines: Array<{
    cuisine: string;
    count: number;
  }>;
  topCities: Array<{
    city: string;
    state: string;
    count: number;
  }>;
}
