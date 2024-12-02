export declare class UpdateProfileDto {
    name?: string;
    email?: string;
    password?: string;
    currentPassword?: string;
}
export declare class RoleDto {
    id: string;
    name: string;
}
export declare class ProfileResponseDto {
    id: string;
    name: string;
    email: string;
    role: RoleDto;
    createdAt: Date;
}
