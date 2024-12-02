import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Seed Roles with explicit IDs
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

    // Seed Permissions
    const readProfilePermission = await prisma.permission.upsert({
      where: { action: 'read:profile' },
      update: {},
      create: {
        action: 'read:profile',
        roles: {
          connect: [
            { id: '1' }, // User role
            { id: '2' }, // Admin role
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
            { id: '1' }, // User role
            { id: '2' }, // Admin role
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
            { id: '2' }, // Admin role only
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
  } catch (error) {
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
