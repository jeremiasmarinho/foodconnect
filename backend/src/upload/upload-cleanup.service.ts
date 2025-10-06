import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class UploadCleanupService {
  private readonly logger = new Logger(UploadCleanupService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Clean up temporary files older than 24 hours
   * Runs every day at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupTempFiles(): Promise<void> {
    try {
      const uploadsDir = this.configService.get('UPLOADS_DIR', './uploads');
      const tempDir = path.join(uploadsDir, 'temp');
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      const files = await this.getFilesOlderThan(tempDir, maxAge);

      for (const file of files) {
        try {
          await fs.unlink(file);
          this.logger.log(`Cleaned up temp file: ${file}`);
        } catch (error) {
          this.logger.error(`Failed to delete temp file ${file}:`, error);
        }
      }

      if (files.length > 0) {
        this.logger.log(
          `Cleanup completed: ${files.length} temp files removed`,
        );
      }
    } catch (error) {
      this.logger.error('Error during temp files cleanup:', error);
    }
  }

  /**
   * Clean up orphaned files (files not referenced in database)
   * Runs every week on Sunday at 3 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanupOrphanedFiles(): Promise<void> {
    try {
      // This would require database integration to check which files are actually referenced
      // For now, we'll just log that this cleanup would run
      this.logger.log('Orphaned files cleanup would run here');

      // TODO: Implement database check for referenced files
      // 1. Get all file paths from uploads directory
      // 2. Query database for all referenced file paths
      // 3. Delete files that exist on disk but not in database
    } catch (error) {
      this.logger.error('Error during orphaned files cleanup:', error);
    }
  }

  /**
   * Get files older than specified age in milliseconds
   */
  private async getFilesOlderThan(
    dir: string,
    maxAge: number,
  ): Promise<string[]> {
    const oldFiles: string[] = [];

    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      const now = Date.now();

      for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isFile()) {
          const stats = await fs.stat(fullPath);
          const age = now - stats.mtime.getTime();

          if (age > maxAge) {
            oldFiles.push(fullPath);
          }
        } else if (item.isDirectory()) {
          // Recursively check subdirectories
          const subDirFiles = await this.getFilesOlderThan(fullPath, maxAge);
          oldFiles.push(...subDirFiles);
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // Directory doesn't exist, which is fine
    }

    return oldFiles;
  }

  /**
   * Manual cleanup trigger for specific directory
   */
  async cleanupDirectory(
    dirPath: string,
    maxAge: number = 24 * 60 * 60 * 1000,
  ): Promise<number> {
    try {
      const files = await this.getFilesOlderThan(dirPath, maxAge);

      for (const file of files) {
        try {
          await fs.unlink(file);
        } catch (error) {
          this.logger.error(`Failed to delete file ${file}:`, error);
        }
      }

      this.logger.log(
        `Manual cleanup completed: ${files.length} files removed from ${dirPath}`,
      );
      return files.length;
    } catch (error) {
      this.logger.error(`Error during manual cleanup of ${dirPath}:`, error);
      throw error;
    }
  }
}
