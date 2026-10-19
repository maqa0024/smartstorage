const { PrismaClient } = require('@prisma/client');

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

// Əvvəlki versiyalardan qala bilən köhnə email-lər
const oldEmails = [
  'mahammadli@qu.edu.az',
  'a.gasimova@qu.edu.az',
  'gabilzade@qu.edu.az',
];

async function main() {
  const removedTests = await prisma.user.deleteMany({
    where: { email: { startsWith: 'test-', endsWith: '@example.com' } },
  });
  const removedOld = await prisma.user.deleteMany({
    where: { email: { in: oldEmails } },
  });
  console.log(`Silindi: ${removedTests.count} test, ${removedOld.count} köhnə istifadəçi`);

  for (const u of users) {
    const saved = await prisma.user.upsert({
      where: { email: u.email },
      update: { ...u, isVerified: true },
      create: { ...u, isVerified: true },
    });
    console.log(`✅ ${saved.role}: ${saved.email} (${saved.fullName})`);
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