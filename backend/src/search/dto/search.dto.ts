import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export enum SearchType {
  ALL = 'all',
  USERS = 'users',
  POSTS = 'posts',
  RESTAURANTS = 'restaurants',
}

export class SearchQueryDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}

export interface UserSearchResult {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  isFollowing?: boolean;
  type: 'user';
}

export interface PostSearchResult {
  id: string;
  content: string;
  imageUrls: string[];
  createdAt: Date;
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
  establishment?: {
    id: string;
    name: string;
  };
  likesCount: number;
  commentsCount: number;
  type: 'post';
}

export interface RestaurantSearchResult {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  cuisine?: string;
  priceRange: number;
  rating: number;
  imageUrl?: string;
  type: 'restaurant';
}

export type SearchResult =
  | UserSearchResult
  | PostSearchResult
  | RestaurantSearchResult;

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  type: SearchType;
}
