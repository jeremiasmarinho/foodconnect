import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHighlightDto {
  @ApiProperty({ description: 'Story ID to highlight' })
  @IsString()
  storyId: string;

  @ApiProperty({ description: 'Title for the highlight' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Custom cover image URL',
    example: 'https://example.com/cover.jpg',
  })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'Order position in profile',
    example: 1,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  order?: number;
}
