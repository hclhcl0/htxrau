// @ts-nocheck
import type { Payload } from 'payload';

export const seedAccounts = async (payload: Payload) => {
  const testUsers = [
    { email: 'admin@test.com', name: 'Test Admin', role: 'admin', password: 'admin123' },
    { email: 'moderator@test.com', name: 'Test Moderator', role: 'moderator', password: 'admin123' },
    { email: 'editor@test.com', name: 'Test Editor', role: 'editor', password: 'admin123' },
    { email: 'author@test.com', name: 'Test Author', role: 'author', password: 'admin123' },
    { email: 'user@test.com', name: 'Test User', role: 'user', password: 'admin123' },
  ];

  for (const u of testUsers) {
    try {
      const existing = await payload.find({
        collection: 'users',
        where: { email: { equals: u.email } },
      });
      
      if (existing.totalDocs === 0) {
        await payload.create({
          collection: 'users',
          data: {
            email: u.email,
            password: u.password,
            name: u.name,
            role: u.role,
          },
        });
        payload.logger.info(`[Seed] Created ${u.role} account: ${u.email}`);
      } else {
        // Luôn đảm bảo tài khoản admin được hash đúng secret trên môi trường chạy
        await payload.update({
          collection: 'users',
          id: existing.docs[0].id,
          data: {
            password: u.password,
            role: u.role,
          },
        });
        payload.logger.info(`[Seed] Updated ${u.role} account password: ${u.email}`);
      }
    } catch (error: any) {
      payload.logger.error(`[Seed] Error managing ${u.email}: ${error.message}`);
    }
  }
};
