import { IsString, IsOptional, IsUrl, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStoryDto {
  @ApiPropertyOptional({ description: 'Optional text content for the story' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    description: 'Media URL (image or video)',
    example: 'https://example.com/image.jpg',
  })
  @IsUrl()
  mediaUrl: string;

  @ApiPropertyOptional({
    description: 'Media type',
    enum: ['image', 'video'],
    default: 'image',
  })
  @IsString()
  @IsIn(['image', 'video'])
  @IsOptional()
  mediaType?: string;

  @ApiPropertyOptional({
    description: 'Establishment ID if story is tagged at a location',
  })
  @IsString()
  @IsOptional()
  establishmentId?: string;

  @ApiPropertyOptional({
    description: 'Location data as JSON string',
    example:
      '{"lat": -23.550520, "lng": -46.633309, "address": "São Paulo, SP"}',
  })
  @IsString()
  @IsOptional()
  location?: string;
}
