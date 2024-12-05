import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no permissions are specified, allow access
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('user');
    console.log(user);

    if (!user || !user.sub) {
      throw new UnauthorizedException('User is not authenticated');
    }

    // Fetch the user with role and permissions
    const fullUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub, // Ensure `id` is passed correctly here
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    // Check if any of the required permissions are available to the user's role
    return requiredPermissions.some((permission) =>
      fullUser.role.permissions.some(
        (userPermission) => userPermission.action === permission,
      ),
    );
  }
}
