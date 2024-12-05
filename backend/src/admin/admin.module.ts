import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { AuthModule } from '../auth/auth.module'; // Add this import

@Module({
  imports: [
    PrismaModule,
    AuthModule, // Add this line to import AuthModule
  ],
  controllers: [AdminController],
  providers: [PermissionsGuard],
})
export class AdminModule {}
