import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import {
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
  ProfileResponseDto,
} from './dto/index';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password with high salt rounds for security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: { id: true, email: true, name: true },
      });

      return this.generateTokens(user);
    } catch (error) {
      throw new ConflictException('Registration failed');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  private generateTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };

    console.log('Generating tokens for user:', user);

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    console.log('Generated tokens:', { accessToken, refreshToken });

    return {
      accessToken,
      refreshToken,
    };
  }

  async getProfileById(userId: string): Promise<ProfileResponseDto> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId, // Make sure userId is not undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const { name, email, password, currentPassword } = updateProfileDto;

    // Validate that at least one field is being updated
    if (!name && !email && !password) {
      throw new BadRequestException('No update fields provided');
    }

    // Check for email uniqueness if being changed
    if (email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    // If changing password, verify current password
    if (password) {
      if (!currentPassword) {
        throw new BadRequestException(
          'Current password is required to change password',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Perform update
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return updatedUser;
  }
}
