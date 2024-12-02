import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, UpdateProfileDto, ProfileResponseDto } from './dto/index';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    validateUser(email: string, password: string): Promise<{
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        roleId: string;
    }>;
    private generateTokens;
    getProfileById(userId: string): Promise<ProfileResponseDto>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto>;
}
