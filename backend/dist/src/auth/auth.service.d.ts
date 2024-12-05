import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RegisterDto, UpdateProfileDto, ProfileResponseDto } from './dto/index';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private loginAttempts;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    private cleanupAttempts;
    private trackLoginAttempt;
    private resetLoginAttempts;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
    validateUser(email: string, pass: string): Promise<any>;
    getProfileById(userId: string): Promise<ProfileResponseDto>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto>;
}
