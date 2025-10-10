import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    email: string;
    username: string;
  };
}

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * Universal search endpoint
   * GET /search?query=pizza&type=all&page=1&limit=20
   */
  @Get()
  async search(
    @Query(ValidationPipe) searchDto: SearchQueryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const currentUserId = req.user.sub;
    return this.searchService.search(searchDto, currentUserId);
  }

  /**
   * Get autocomplete suggestions
   * GET /search/suggestions?query=joh
   */
  @Get('suggestions')
  async getSuggestions(
    @Query('query') query: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.searchService.getSuggestions(query, limitNum);
  }
}
