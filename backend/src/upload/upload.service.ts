import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  resize?: {
    width?: number;
    height?: number;
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    quality?: number;
  };
  generateThumbnail?: boolean;
  optimizeWebP?: boolean;
}

export interface UploadResult {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  webpUrl?: string;
  path: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DEST', './uploads');
    this.baseUrl = this.configService.get(
      'BACKEND_URL',
      'http://localhost:3001',
    );
    void this.ensureUploadDirectories();
  }

  /**
   * Upload and process image file
   */
  async uploadImage(
    file: Express.Multer.File,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    this.logger.log('Starting image upload', {
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    });

    // Validate file
    await this.validateFile(file, options);

    // Generate unique filename
    const filename = this.generateFilename(file.originalname);
    const filePath = path.join(this.uploadDir, 'images', filename);

    let processedImage = sharp(file.buffer);
    let finalSize = file.size;

    // Apply resize if specified
    if (options.resize) {
      processedImage = processedImage.resize({
        width: options.resize.width,
        height: options.resize.height,
        fit: options.resize.fit || 'cover',
        withoutEnlargement: true,
      });

      // Apply quality if specified
      if (options.resize.quality) {
        processedImage = processedImage.jpeg({
          quality: options.resize.quality,
        });
      }
    }

    // Save main image
    await processedImage.toFile(filePath);
    const stats = await fs.stat(filePath);
    finalSize = stats.size;

    const result: UploadResult = {
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: finalSize,
      url: `${this.baseUrl}/uploads/images/${filename}`,
      path: filePath,
    };

    // Generate thumbnail if requested
    if (options.generateThumbnail) {
      const thumbnailFilename = this.generateThumbnailFilename(filename);
      const thumbnailPath = path.join(
        this.uploadDir,
        'thumbnails',
        thumbnailFilename,
      );

      await sharp(file.buffer)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      result.thumbnailUrl = `${this.baseUrl}/uploads/thumbnails/${thumbnailFilename}`;
    }

    // Generate WebP version if requested
    if (options.optimizeWebP) {
      const webpFilename = this.generateWebPFilename(filename);
      const webpPath = path.join(this.uploadDir, 'webp', webpFilename);

      await sharp(file.buffer)
        .resize(options.resize?.width, options.resize?.height, {
          fit: options.resize?.fit || 'cover',
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toFile(webpPath);

      result.webpUrl = `${this.baseUrl}/uploads/webp/${webpFilename}`;
    }

    this.logger.log('Image upload completed', {
      filename,
      finalSize,
      hasThumbnail: !!result.thumbnailUrl,
      hasWebP: !!result.webpUrl,
    });

    return result;
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    options: UploadOptions = {},
  ): Promise<UploadResult[]> {
    const maxFiles = this.configService.get('MAX_FILES_PER_UPLOAD', 10);

    if (files.length > maxFiles) {
      throw new BadRequestException(
        `Maximum ${maxFiles} files allowed per upload`,
      );
    }

    const results = await Promise.all(
      files.map((file) => this.uploadImage(file, options)),
    );

    this.logger.log('Multiple images uploaded', {
      count: results.length,
      totalSize: results.reduce((sum, r) => sum + r.size, 0),
    });

    return results;
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.uploadDir, 'images', filename);
      await fs.unlink(filePath);

      // Delete thumbnail if exists
      const thumbnailPath = path.join(
        this.uploadDir,
        'thumbnails',
        this.generateThumbnailFilename(filename),
      );
      try {
        await fs.unlink(thumbnailPath);
      } catch {
        // Thumbnail may not exist
      }

      // Delete WebP if exists
      const webpPath = path.join(
        this.uploadDir,
        'webp',
        this.generateWebPFilename(filename),
      );
      try {
        await fs.unlink(webpPath);
      } catch {
        // WebP may not exist
      }

      this.logger.log('File deleted successfully', { filename });
    } catch (error) {
      this.logger.error('Failed to delete file', { filename, error });
      throw new BadRequestException('Failed to delete file');
    }
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(file: Express.Multer.File): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
  }> {
    const metadata = await sharp(file.buffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: file.size,
      hasAlpha: metadata.hasAlpha || false,
    };
  }

  /**
   * Validate uploaded file
   */
  private async validateFile(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<void> {
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options.allowedTypes || [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    // Check file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds limit of ${Math.round(maxSize / 1024 / 1024)}MB`,
      );
    }

    // Check MIME type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      );
    }

    // Validate image using Sharp
    try {
      const metadata = await sharp(file.buffer).metadata();
      if (!metadata.width || !metadata.height) {
        throw new BadRequestException('Invalid image file');
      }
    } catch (error) {
      throw new BadRequestException('Invalid or corrupted image file');
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const hash = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${hash}${ext}`;
  }

  /**
   * Generate thumbnail filename
   */
  private generateThumbnailFilename(originalFilename: string): string {
    const ext = path.extname(originalFilename);
    const name = path.basename(originalFilename, ext);
    return `${name}-thumb${ext}`;
  }

  /**
   * Generate WebP filename
   */
  private generateWebPFilename(originalFilename: string): string {
    const name = path.basename(
      originalFilename,
      path.extname(originalFilename),
    );
    return `${name}.webp`;
  }

  /**
   * Ensure upload directories exist
   */
  private async ensureUploadDirectories(): Promise<void> {
    const directories = [
      path.join(this.uploadDir, 'images'),
      path.join(this.uploadDir, 'thumbnails'),
      path.join(this.uploadDir, 'webp'),
      path.join(this.uploadDir, 'temp'),
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        this.logger.error('Failed to create upload directory', { dir, error });
      }
    }
  }

  /**
   * Clean up temporary files older than 1 hour
   */
  async cleanupTempFiles(): Promise<void> {
    const tempDir = path.join(this.uploadDir, 'temp');
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    try {
      const files = await fs.readdir(tempDir);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (stats.mtime.getTime() < oneHourAgo) {
          await fs.unlink(filePath);
          this.logger.log('Cleaned up temp file', { file });
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup temp files', error);
    }
  }
}
