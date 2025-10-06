import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadCleanupService } from './upload-cleanup.service';
import * as multer from 'multer';

@Module({
  imports: [
    ConfigModule,
    ScheduleModule.forRoot(),
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: multer.memoryStorage(), // Store in memory for processing
        limits: {
          fileSize: configService.get('MAX_FILE_SIZE', 15 * 1024 * 1024), // 15MB default
          files: configService.get('MAX_FILES_PER_UPLOAD', 10),
        },
        fileFilter: (req, file, callback) => {
          // Allow images only
          if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            callback(null, true);
          } else {
            callback(new Error('Only image files are allowed!'), false);
          }
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService, UploadCleanupService],
  exports: [UploadService],
})
export class UploadModule {}
