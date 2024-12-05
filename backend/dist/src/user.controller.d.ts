import { PrismaService } from './prisma/prisma.service';
export declare class UserController {
    private prisma;
    constructor(prisma: PrismaService);
    getUserProfile(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
        role: {
            id: string;
            name: string;
        };
    }>;
    updateProfile(req: any, updateData: {
        name?: string;
        email?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: {
            id: string;
            name: string;
        };
    }>;
}
