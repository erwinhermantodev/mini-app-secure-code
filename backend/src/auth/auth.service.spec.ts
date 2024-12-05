import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

// Mock dependencies
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-secret'),
};

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        roleId: 'user-role',
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(mockJwtService, 'sign').mockReturnValue('mock-token');

      const result = await authService.login(loginDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test User',
        roleId: 'user-role',
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue({
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        roleId: 'user-role',
        createdAt: new Date(),
        password: await bcrypt.hash(registerDto.password, 12),
      });
      jest.spyOn(mockJwtService, 'sign').mockReturnValue('mock-token');

      const result = await authService.register(registerDto);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        roleId: 'user-role',
        createdAt: new Date(),
        password: 'hashed-password',
      });

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const mockUser = {
        id: '1',
        email: email,
        password: await bcrypt.hash(password, 10),
        name: 'Test User',
        roleId: 'user-role',
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await authService.validateUser(email, password);
      expect(result).toBeTruthy();
      expect(result).not.toHaveProperty('password');
    });

    it('should return null for invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const mockUser = {
        id: '1',
        email: email,
        password: await bcrypt.hash('correctpassword', 10),
        name: 'Test User',
        roleId: 'user-role',
        createdAt: new Date(),
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await authService.validateUser(email, password);
      expect(result).toBeNull();
    });
  });

  describe('getProfileById', () => {
    it('should get user profile successfully', async () => {
      const userId = '1';
      const mockUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        roleId: 'user-role',
        createdAt: new Date(),
        password: 'hashed-password', // Typically not returned in profile
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

      const result = await authService.getProfileById(userId);
      expect(result).toEqual({
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        role: 'user-role',
        createdAt: mockUser.createdAt,
      });
    });

    it('should throw error if user not found', async () => {
      const userId = '1';
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(authService.getProfileById(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const userId = '1';
      const updateProfileDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const existingUser = {
        id: userId,
        email: 'old@example.com',
        password: await bcrypt.hash('currentpassword', 10),
        name: 'Old Name',
        roleId: 'user-role',
        createdAt: new Date(),
      };
      const updatedUser = {
        id: userId,
        name: updateProfileDto.name,
        email: updateProfileDto.email,
        roleId: 'user-role',
        createdAt: new Date(),
        password: existingUser.password,
      };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(null) // Check email uniqueness
        .mockResolvedValueOnce(existingUser); // Find user to update

      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

      const result = await authService.updateProfile(userId, updateProfileDto);
      expect(result).toEqual({
        id: userId,
        name: updateProfileDto.name,
        email: updateProfileDto.email,
        role: 'user-role',
        createdAt: updatedUser.createdAt,
      });
    });
  });
});
