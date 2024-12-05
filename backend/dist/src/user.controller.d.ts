import { PrismaService } from './prisma/prisma.service';
export declare class UserController {
    private prisma;
    constructor(prisma: PrismaService);
    getUserProfile(req: any): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        email: string;
        createdAt: Date;
    }>;
    updateProfile(req: any, updateData: {
        name?: string;
        email?: string;
    }): Promise<{
        role: {
            id: string;
            name: string;
        };
        id: string;
        name: string;
        email: string;
    }>;
}
