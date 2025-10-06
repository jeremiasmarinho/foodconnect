import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    const menuItem = await this.prisma.menuItem.create({
      data: createMenuItemDto,
      include: {
        establishment: true,
      },
    });

    return menuItem;
  }

  async findAll() {
    const menuItems = await this.prisma.menuItem.findMany({
      include: {
        establishment: true,
      },
    });

    return menuItems;
  }

  async findByEstablishment(establishmentId: string) {
    const menuItems = await this.prisma.menuItem.findMany({
      where: { establishmentId },
      include: {
        establishment: true,
      },
    });

    return menuItems;
  }

  async findOne(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        establishment: true,
      },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    const menuItem = await this.prisma.menuItem.update({
      where: { id },
      data: updateMenuItemDto,
      include: {
        establishment: true,
      },
    });

    return menuItem;
  }

  async remove(id: string) {
    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}
