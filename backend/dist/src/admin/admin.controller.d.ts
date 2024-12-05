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
            role: {
                name: string;
            };
            id: string;
            name: string;
            email: string;
            createdAt: Date;
        }[];
    }>;
}
