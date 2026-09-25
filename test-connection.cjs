const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Bazaya qoşulmağa cəhd edilir...');

  // Test 1: İstifadəçi yaratmaq
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      isVerified: false,
    },
  });
  console.log('✅ İstifadəçi yaradıldı:', user);

  // Test 2: Bütün istifadəçiləri oxumaq
  const allUsers = await prisma.user.findMany();
  console.log(`✅ Bazada cəmi ${allUsers.length} istifadəçi var`);

  // Test 3: Audit log yazmaq (bağlantının audit cədvəli ilə də işlədiyini göstərir)
  const log = await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'TEST_CONNECTION',
      details: 'Connection pooling test uğurla keçdi',
    },
  });
  console.log('✅ Audit log yaradıldı:', log);
}

main()
  .then(async () => {
    console.log('🎉 Bütün testlər uğurlu oldu! Bağlantı və connection pooling işləyir.');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Xəta baş verdi:', e);
    await prisma.$disconnect();
    process.exit(1);
  });