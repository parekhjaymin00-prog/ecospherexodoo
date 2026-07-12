import prisma from './client.js';

async function seed() {
  console.log('Seeding database...');

  // Create default ESG Config
  const existingConfig = await prisma.eSGConfig.findFirst();
  if (!existingConfig) {
    await prisma.eSGConfig.create({
      data: {
        organizationName: 'EcoSphere Organization',
        environmentalWeight: 40,
        socialWeight: 30,
        governanceWeight: 30,
      },
    });
    console.log('✅ Default ESG Config created');
  }

  // Create sample departments
  const departments = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Operations', code: 'OPS' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Marketing', code: 'MKT' },
  ];

  for (const dept of departments) {
    const existing = await prisma.department.findUnique({ where: { code: dept.code } });
    if (!existing) {
      await prisma.department.create({ data: dept });
    }
  }
  console.log('✅ Departments seeded');

  // Create sample department scores for the last 6 months
  const allDepts = await prisma.department.findMany();
  const now = new Date();

  for (const dept of allDepts) {
    for (let i = 5; i >= 0; i--) {
      const scoredAt = new Date(now.getFullYear(), now.getMonth() - i, 15);
      const existing = await prisma.departmentScore.findFirst({
        where: { departmentId: dept.id, scoredAt },
      });
      if (!existing) {
        await prisma.departmentScore.create({
          data: {
            departmentId: dept.id,
            environmentalScore: 50 + Math.random() * 40,
            socialScore: 45 + Math.random() * 45,
            governanceScore: 55 + Math.random() * 35,
            totalScore: 50 + Math.random() * 40,
            scoredAt,
          },
        });
      }
    }
  }
  console.log('✅ Department scores seeded');

  console.log('Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
