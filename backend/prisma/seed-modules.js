import prisma from './client.js';

async function seedModules() {
  console.log('Seeding module data...');

  // Seed CSR Activity categories
  const csrCategories = [
    { name: 'Community Service', type: 'CSR_ACTIVITY' },
    { name: 'Environmental Cleanup', type: 'CSR_ACTIVITY' },
    { name: 'Education & Training', type: 'CSR_ACTIVITY' },
    { name: 'Health & Wellness', type: 'CSR_ACTIVITY' },
    { name: 'Charity & Donations', type: 'CSR_ACTIVITY' },
  ];

  for (const cat of csrCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type },
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }
  console.log('✅ CSR categories seeded');

  // Seed Challenge categories
  const challengeCategories = [
    { name: 'Sustainability', type: 'CHALLENGE' },
    { name: 'Innovation', type: 'CHALLENGE' },
    { name: 'Team Building', type: 'CHALLENGE' },
  ];

  for (const cat of challengeCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, type: cat.type },
    });
    if (!existing) {
      await prisma.category.create({ data: cat });
    }
  }
  console.log('✅ Challenge categories seeded');

  // Seed Emission Factors
  const emissionFactors = [
    { name: 'Electricity (Grid Average)', category: 'Energy', unit: 'kWh', factor: 0.42, source: 'EPA', year: 2024 },
    { name: 'Natural Gas', category: 'Energy', unit: 'therms', factor: 5.3, source: 'EPA', year: 2024 },
    { name: 'Diesel Fuel', category: 'Transport', unit: 'liters', factor: 2.68, source: 'DEFRA', year: 2024 },
    { name: 'Gasoline', category: 'Transport', unit: 'liters', factor: 2.31, source: 'DEFRA', year: 2024 },
    { name: 'Air Travel (Domestic)', category: 'Transport', unit: 'km', factor: 0.255, source: 'ICAO', year: 2024 },
    { name: 'Air Travel (International)', category: 'Transport', unit: 'km', factor: 0.195, source: 'ICAO', year: 2024 },
    { name: 'Water Supply', category: 'Water', unit: 'm³', factor: 0.344, source: 'DEFRA', year: 2024 },
    { name: 'Paper (Office)', category: 'Materials', unit: 'kg', factor: 0.92, source: 'EPA', year: 2024 },
    { name: 'Waste to Landfill', category: 'Waste', unit: 'tonnes', factor: 587, source: 'DEFRA', year: 2024 },
    { name: 'Recycled Waste', category: 'Waste', unit: 'tonnes', factor: 21.4, source: 'DEFRA', year: 2024 },
  ];

  for (const ef of emissionFactors) {
    const existing = await prisma.emissionFactor.findFirst({
      where: { name: ef.name, year: ef.year },
    });
    if (!existing) {
      await prisma.emissionFactor.create({ data: ef });
    }
  }
  console.log('✅ Emission factors seeded');

  // Seed Environmental Goals
  const now = new Date();
  const goals = [
    { title: 'Reduce Carbon Emissions by 25%', targetValue: 25, currentValue: 12, unit: '%', startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear(), 11, 31) },
    { title: 'Zero Waste to Landfill', targetValue: 100, currentValue: 68, unit: '%', startDate: new Date(now.getFullYear(), 0, 1), endDate: new Date(now.getFullYear(), 11, 31) },
    { title: 'Reduce Water Usage by 15%', targetValue: 15, currentValue: 9, unit: '%', startDate: new Date(now.getFullYear(), 3, 1), endDate: new Date(now.getFullYear() + 1, 2, 31) },
  ];

  for (const goal of goals) {
    const existing = await prisma.environmentalGoal.findFirst({
      where: { title: goal.title },
    });
    if (!existing) {
      await prisma.environmentalGoal.create({ data: goal });
    }
  }
  console.log('✅ Environmental goals seeded');

  console.log('Module seeding complete!');
}

seedModules()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
