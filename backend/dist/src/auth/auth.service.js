"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcrypt");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.loginAttempts = new Map();
        setInterval(() => this.cleanupAttempts(), 15 * 60 * 1000);
    }
    async decryptPassword(encryptedPassword, key) {
        try {
            const [ivBase64, encryptedBase64] = encryptedPassword.split(':');
            if (!ivBase64 || !encryptedBase64) {
                throw new Error('Invalid encrypted password format');
            }
            const iv = Uint8Array.from(atob(ivBase64), (c) => c.charCodeAt(0));
            const encrypted = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
            const cryptoKey = await crypto.subtle.importKey('raw', Uint8Array.from(atob(key), (c) => c.charCodeAt(0)), { name: 'AES-CBC', length: 256 }, false, ['decrypt']);
            const decryptedBuffer = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, cryptoKey, encrypted);
            return new TextDecoder().decode(decryptedBuffer);
        }
        catch (error) {
            console.error('Decryption error:', error);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    getPasswordFromSplit(decryptedPassword) {
        const parts = decryptedPassword.split('-');
        return parts.slice(1).join('-');
    }
    cleanupAttempts() {
        const now = Date.now();
        for (const [key, attempt] of this.loginAttempts.entries()) {
            if (now - attempt.lastAttempt > 15 * 60 * 1000) {
                this.loginAttempts.delete(key);
            }
        }
    }
    trackLoginAttempt(email) {
        const now = Date.now();
        const key = email.toLowerCase();
        const existingAttempt = this.loginAttempts.get(key) || {
            attempts: 0,
            lastAttempt: now,
            blockedUntil: 0,
        };
        if (existingAttempt.blockedUntil > now) {
            throw new common_1.UnauthorizedException('Account temporarily blocked. Please try again later.');
        }
        if (now - existingAttempt.lastAttempt > 15 * 60 * 1000) {
            existingAttempt.attempts = 0;
        }
        existingAttempt.attempts++;
        existingAttempt.lastAttempt = now;
        if (existingAttempt.attempts > 5) {
            existingAttempt.blockedUntil = now + 15 * 60 * 1000;
            this.loginAttempts.set(key, existingAttempt);
            console.warn(`Login attempts blocked for email: ${email}`);
            throw new common_1.UnauthorizedException('Too many login attempts. Account temporarily blocked.');
        }
        this.loginAttempts.set(key, existingAttempt);
        return true;
    }
    resetLoginAttempts(email) {
        const key = email.toLowerCase();
        this.loginAttempts.delete(key);
    }
    async login(loginDto) {
        const { email, password: encryptedPassword } = loginDto;
        this.trackLoginAttempt(email);
        try {
            const key = 'tgK+Gkb9qVIRUSAaHahODfYwbSfW/t7FfugOoeB15jk=';
            if (!key) {
                throw new Error('Encryption key not configured');
            }
            const decryptedCombined = await this.decryptPassword(encryptedPassword, key);
            console.log('decryptedCombined');
            console.log(decryptedCombined);
            const actualPassword = this.getPasswordFromSplit(decryptedCombined);
            console.log('actualPassword');
            console.log(actualPassword);
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(actualPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            this.resetLoginAttempts(email);
            return this.generateTokens(user);
        }
        catch (error) {
            console.error('Login error:', error);
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async register(registerDto) {
        const { email, password, name } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
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
        }
        catch (error) {
            throw new common_1.ConflictException('Registration failed');
        }
    }
    generateTokens(user) {
        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET'),
            expiresIn: '1h',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET'),
            expiresIn: '7d',
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async getProfileById(userId) {
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
    async updateProfile(userId, updateProfileDto) {
        const { name, email, password, currentPassword } = updateProfileDto;
        if (!name && !email && !password) {
            throw new common_1.BadRequestException('No update fields provided');
        }
        if (email) {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser && existingUser.id !== userId) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        if (password) {
            if (!currentPassword) {
                throw new common_1.BadRequestException('Current password is required to change password');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new common_1.BadRequestException('Current password is incorrect');
            }
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        if (password) {
            updateData.password = await bcrypt.hash(password, 12);
        }
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map