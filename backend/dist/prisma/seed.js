"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    try {
        const userRole = await prisma.role.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                name: 'User',
            },
        });
        const adminRole = await prisma.role.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                name: 'Admin',
            },
        });
        const readProfilePermission = await prisma.permission.upsert({
            where: { action: 'read:profile' },
            update: {},
            create: {
                action: 'read:profile',
                roles: {
                    connect: [
                        { id: '1' },
                        { id: '2' },
                    ],
                },
            },
        });
        const updateProfilePermission = await prisma.permission.upsert({
            where: { action: 'update:profile' },
            update: {},
            create: {
                action: 'update:profile',
                roles: {
                    connect: [
                        { id: '1' },
                        { id: '2' },
                    ],
                },
            },
        });
        const manageUsersPermission = await prisma.permission.upsert({
            where: { action: 'manage:users' },
            update: {},
            create: {
                action: 'manage:users',
                roles: {
                    connect: [
                        { id: '2' },
                    ],
                },
            },
        });
        console.log('Seeding completed successfully:');
        console.log('Roles:', { userRole, adminRole });
        console.log('Permissions:', {
            readProfilePermission,
            updateProfilePermission,
            manageUsersPermission,
        });
    }
    catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    }
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error('Seed script failed:', e);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map