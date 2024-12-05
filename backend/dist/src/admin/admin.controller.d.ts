import { PrismaService } from '../prisma/prisma.service';
export declare class AdminController {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(req: any): Promise<{
        totalUsers: number;
        usersByRole: {
            roleName: string;
            count: number;
        }[];
        recentUsers: {
            id: string;
            email: string;
            name: string;
            createdAt: Date;
            role: {
                name: string;
            };
        }[];
    }>;
}
