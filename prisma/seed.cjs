require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const users = [
  {
    email: 'admin@qu.edu.az',
    fullName: 'Admin (Təsərrüfat Müdiri)',
    role: 'ADMIN',
    faculty: 'İnzibati İdarəetmə',
    department: 'Təsərrüfat və Maddi-Texniki Təminat Şöbəsi',
  },
  {
    email: 'manager@qu.edu.az',
    fullName: 'Manager (Şöbə Müdiri)',
    role: 'MANAGER',
    faculty: 'İnzibati İdarəetmə',
    department: 'Mükəmməllik Mərkəzi',
  },
  {
    email: 'staff@qu.edu.az',
    fullName: 'Staff (İşçi)',
    role: 'STAFF',
    faculty: 'İnzibati İdarəetmə',
    department: 'Mükəmməllik Mərkəzi',
  },
];

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password) {
    throw new Error('SEED_PASSWORD .env faylında tapılmadı');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  for (const u of users) {
    const saved = await prisma.user.upsert({
      where: { email: u.email },
      update: { ...u, isVerified: true, passwordHash },
      create: { ...u, isVerified: true, passwordHash },
    });
    console.log(`✅ ${saved.role}: ${saved.email} (parol təyin olundu)`);
  }

  const total = await prisma.user.count();
  console.log(`Bazada cəmi istifadəçi: ${total}`);
}

main()
  .catch((e) => {
    console.error('❌ Xəta:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });