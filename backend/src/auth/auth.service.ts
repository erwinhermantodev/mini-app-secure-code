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

  // Function to decrypt the password using Web Crypto API
  private async decryptPassword(
    encryptedPassword: string,
    key: string,
  ): Promise<string> {
    try {
      const [ivBase64, encryptedBase64] = encryptedPassword.split(':');
      if (!ivBase64 || !encryptedBase64) {
        throw new Error('Invalid encrypted password format');
      }

      // Convert base64 to ArrayBuffer
      const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
      const encrypted = Uint8Array.from(atob(encryptedBase64), (c) =>
        c.charCodeAt(0),
      );

      // Import the key
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        Uint8Array.from(atob(key), (c) => c.charCodeAt(0)),
        { name: 'AES-CBC', length: 256 },
        false,
        ['decrypt'],
      );

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv },
        cryptoKey,
        encrypted,
      );

      // Convert ArrayBuffer to string
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // Function to split password and get the actual password part
  private getPasswordFromSplit(decryptedPassword: string): string {
    const parts = decryptedPassword.split('-');
    return parts.slice(1).join('-');
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
    const { email, password: encryptedPassword } = loginDto;

    // Track login attempt
    this.trackLoginAttempt(email);

    try {
      // Get the encryption key from config
      const key = 'tgK+Gkb9qVIRUSAaHahODfYwbSfW/t7FfugOoeB15jk=';
      if (!key) {
        throw new Error('Encryption key not configured');
      }

      // Decrypt the password
      const decryptedCombined = await this.decryptPassword(
        encryptedPassword,
        key,
      );

      console.log('decryptedCombined');
      console.log(decryptedCombined);

      // Get the actual password part
      const actualPassword = this.getPasswordFromSplit(decryptedCombined);

      console.log('actualPassword');
      console.log(actualPassword);
      // Find the user
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Compare the decrypted password with stored hash
      const isPasswordValid = await bcrypt.compare(
        actualPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Reset login attempts on successful login
      this.resetLoginAttempts(email);

      // Generate and return tokens
      return this.generateTokens(user);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid credentials');
    }
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
