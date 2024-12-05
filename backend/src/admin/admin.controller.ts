import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('/dashboard')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:users')
  async getDashboardStats(@Request() req) {
    const totalUsers = await this.prisma.user.count();
    const usersByRole = await this.prisma.user.groupBy({
      by: ['roleId'],
      _count: {
        id: true,
      },
    });

    const roles = await this.prisma.role.findMany();

    return {
      totalUsers,
      usersByRole: usersByRole.map((role) => {
        const roleDetails = roles.find((r) => r.id === role.roleId);
        return {
          roleName: roleDetails ? roleDetails.name : 'Unknown',
          count: role._count.id,
        };
      }),
      recentUsers: await this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      }),
    };
  }
}
