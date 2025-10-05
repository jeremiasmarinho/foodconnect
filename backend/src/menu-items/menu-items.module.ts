import { Module } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsController } from './menu-items.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [MenuItemsController],
  providers: [MenuItemsService, PrismaService],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
