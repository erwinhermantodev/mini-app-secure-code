import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { Permissions } from './common/decorators/permissions.decorator';
import { PrismaService } from './prisma/prisma.service';

@Controller('user')
export class UserController {
  constructor(private prisma: PrismaService) {}

  @Get('/profile')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('read:profile')
  async getUserProfile(@Request() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });
    return user;
  }

  @Put('/profile')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('update:profile')
  async updateProfile(
    @Request() req,
    @Body() updateData: { name?: string; email?: string },
  ) {
    const { name, email } = updateData;

    const updatedUser = await this.prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedUser;
  }
}
