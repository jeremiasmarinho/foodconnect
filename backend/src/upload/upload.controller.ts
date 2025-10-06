import {
  Controller,
  Post,
  Delete,
  Get,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Body,
  Param,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService, UploadOptions, UploadResult } from './upload.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload single image',
    description:
      'Upload and process a single image file with optional resizing and optimization',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        resize: {
          type: 'string',
          description: 'JSON string with resize options',
          example: '{"width": 800, "height": 600, "quality": 85}',
        },
        generateThumbnail: {
          type: 'boolean',
          default: false,
        },
        optimizeWebP: {
          type: 'boolean',
          default: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        filename: { type: 'string' },
        originalName: { type: 'string' },
        mimeType: { type: 'string' },
        size: { type: 'number' },
        url: { type: 'string' },
        thumbnailUrl: { type: 'string' },
        webpUrl: { type: 'string' },
      },
    },
  })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      resize?: string;
      generateThumbnail?: boolean;
      optimizeWebP?: boolean;
    },
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const options: UploadOptions = {
      generateThumbnail: body.generateThumbnail || false,
      optimizeWebP: body.optimizeWebP || false,
    };

    // Parse resize options if provided
    if (body.resize) {
      try {
        options.resize = JSON.parse(body.resize);
      } catch (error) {
        throw new BadRequestException('Invalid resize options JSON');
      }
    }

    return this.uploadService.uploadImage(file, options);
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiOperation({
    summary: 'Upload multiple images',
    description: 'Upload and process multiple image files (max 10)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        resize: {
          type: 'string',
          description: 'JSON string with resize options',
        },
        generateThumbnail: {
          type: 'boolean',
          default: false,
        },
        optimizeWebP: {
          type: 'boolean',
          default: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          filename: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          size: { type: 'number' },
          url: { type: 'string' },
          thumbnailUrl: { type: 'string' },
          webpUrl: { type: 'string' },
        },
      },
    },
  })
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body()
    body: {
      resize?: string;
      generateThumbnail?: boolean;
      optimizeWebP?: boolean;
    },
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const options: UploadOptions = {
      generateThumbnail: body.generateThumbnail || false,
      optimizeWebP: body.optimizeWebP || false,
    };

    // Parse resize options if provided
    if (body.resize) {
      try {
        options.resize = JSON.parse(body.resize);
      } catch (error) {
        throw new BadRequestException('Invalid resize options JSON');
      }
    }

    return this.uploadService.uploadMultipleImages(files, options);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload user avatar',
    description:
      'Upload and process user avatar with automatic resizing to 200x200',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const options: UploadOptions = {
      maxSize: 5 * 1024 * 1024, // 5MB max for avatars
      resize: {
        width: 200,
        height: 200,
        fit: 'cover',
        quality: 90,
      },
      generateThumbnail: false, // Avatar is already small
      optimizeWebP: true,
    };

    return this.uploadService.uploadImage(file, options);
  }

  @Post('restaurant-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload restaurant image',
    description: 'Upload restaurant image with automatic optimization',
  })
  @ApiConsumes('multipart/form-data')
  async uploadRestaurantImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const options: UploadOptions = {
      maxSize: 15 * 1024 * 1024, // 15MB max for restaurant images
      resize: {
        width: 1200,
        height: 800,
        fit: 'cover',
        quality: 85,
      },
      generateThumbnail: true,
      optimizeWebP: true,
    };

    return this.uploadService.uploadImage(file, options);
  }

  @Post('post-image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload post image',
    description: 'Upload food post image with optimization',
  })
  @ApiConsumes('multipart/form-data')
  async uploadPostImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { generateWebP?: boolean },
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const options: UploadOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB max for post images
      resize: {
        width: 800,
        height: 800,
        fit: 'inside', // Keep aspect ratio
        quality: 85,
      },
      generateThumbnail: true,
      optimizeWebP: body.generateWebP || true,
    };

    return this.uploadService.uploadImage(file, options);
  }

  @Get('metadata')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Get image metadata',
    description: 'Extract metadata from uploaded image without saving',
  })
  @ApiConsumes('multipart/form-data')
  async getImageMetadata(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.uploadService.getImageMetadata(file);
  }

  @Delete(':filename')
  @ApiOperation({
    summary: 'Delete uploaded file',
    description: 'Delete an uploaded file and its variants (thumbnail, WebP)',
  })
  @ApiResponse({
    status: 200,
    description: 'File deleted successfully',
  })
  async deleteFile(@Param('filename') filename: string) {
    await this.uploadService.deleteFile(filename);
    return { message: 'File deleted successfully' };
  }

  @Get('health')
  @Public()
  @ApiOperation({
    summary: 'Upload service health check',
    description: 'Check if the upload service is working properly',
  })
  healthCheck() {
    return {
      service: 'upload',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxFileSize: '15MB',
      features: {
        resize: true,
        thumbnails: true,
        webpOptimization: true,
        multipleUploads: true,
      },
    };
  }
}
