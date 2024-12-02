import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, UpdateProfileDto, ProfileResponseDto } from './dto/index';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: any): Promise<ProfileResponseDto>;
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto>;
}
