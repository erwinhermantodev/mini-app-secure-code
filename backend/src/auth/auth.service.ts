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

// In-memory login attempt tracking
interface LoginAttempt {
  attempts: number;
  lastAttempt: number;
  blockedUntil: number;
}

@Injectable()
export class AuthService {
  // In-memory storage for login attempts
  private loginAttempts: Map<string, LoginAttempt> = new Map();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // Optional: Clean up old attempts periodically
    setInterval(() => this.cleanupAttempts(), 15 * 60 * 1000);
  }

  // Clean up old login attempts
  private cleanupAttempts() {
    const now = Date.now();
    for (const [key, attempt] of this.loginAttempts.entries()) {
      // Remove attempts older than 15 minutes
      if (now - attempt.lastAttempt > 15 * 60 * 1000) {
        this.loginAttempts.delete(key);
      }
    }
  }

  // Track and validate login attempts
  private trackLoginAttempt(email: string): boolean {
    const now = Date.now();
    const key = email.toLowerCase();

    // Retrieve or create login attempt record
    const existingAttempt = this.loginAttempts.get(key) || {
      attempts: 0,
      lastAttempt: now,
      blockedUntil: 0,
    };

    // Check if account is currently blocked
    if (existingAttempt.blockedUntil > now) {
      throw new UnauthorizedException(
        'Account temporarily blocked. Please try again later.',
      );
    }

    // Reset attempts if more than 15 minutes have passed
    if (now - existingAttempt.lastAttempt > 15 * 60 * 1000) {
      existingAttempt.attempts = 0;
    }

    // Increment attempts
    existingAttempt.attempts++;
    existingAttempt.lastAttempt = now;

    // Block if too many attempts
    if (existingAttempt.attempts > 5) {
      // Block for 15 minutes
      existingAttempt.blockedUntil = now + 15 * 60 * 1000;
      this.loginAttempts.set(key, existingAttempt);

      // Log the blocking event
      console.warn(`Login attempts blocked for email: ${email}`);

      throw new UnauthorizedException(
        'Too many login attempts. Account temporarily blocked.',
      );
    }

    // Save the updated attempt
    this.loginAttempts.set(key, existingAttempt);

    return true;
  }

  // Reset login attempts on successful login
  private resetLoginAttempts(email: string) {
    const key = email.toLowerCase();
    this.loginAttempts.delete(key);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Track and validate login attempt
    // const query = `SELECT * FROM "public"."User" WHERE name = ${email}`;
    // const users = await this.prisma.$queryRawUnsafe(query, email);
    // // console.log(unsafeQuery);
    // console.log('users');
    // console.log(users);
    // return users;
    this.trackLoginAttempt(email);

    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset attempts on successful login
    this.resetLoginAttempts(email);

    return this.generateTokens(user);
  }

  // The rest of the methods remain the same as in the original service
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

  private generateTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Other methods from the original service remain unchanged
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async getProfileById(userId: string): Promise<ProfileResponseDto> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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
