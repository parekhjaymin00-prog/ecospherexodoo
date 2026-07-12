import prisma from '../prisma/client.js';

const DEFAULT_SETTINGS = {
  'notification.email': 'true',
  'notification.inApp': 'true',
  'notification.badge': 'true',
  'notification.challenge': 'true',
  'notification.csr': 'true',
  'notification.audit': 'true',
  'notification.compliance': 'true',
  'notification.policyReminder': 'true',
  'business.autoEmissionCalc': 'true',
  'business.evidenceRequiredCSR': 'false',
  'business.autoBadgeAward': 'true',
  'business.complianceDueReminder': 'true',
  'business.policyReminder': 'true',
  'business.challengeReminder': 'true',
  'org.fiscalYearStart': '1',
  'org.defaultDepartment': '',
};

export async function getSettings(req, res) {
  try {
    const settings = await prisma.appSettings.findMany();
    const result = { ...DEFAULT_SETTINGS };
    settings.forEach((s) => { result[s.key] = s.value; });
    return res.json({ settings: result });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateSettings(req, res) {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') return res.status(400).json({ error: 'Settings object is required' });

    const updates = Object.entries(settings);
    for (const [key, value] of updates) {
      await prisma.appSettings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    const allSettings = await prisma.appSettings.findMany();
    const result = { ...DEFAULT_SETTINGS };
    allSettings.forEach((s) => { result[s.key] = s.value; });
    return res.json({ settings: result, message: 'Settings updated successfully' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getESGConfig(req, res) {
  try {
    let config = await prisma.eSGConfig.findFirst();
    if (!config) {
      config = await prisma.eSGConfig.create({ data: { organizationName: 'EcoSphere Organization', environmentalWeight: 40, socialWeight: 30, governanceWeight: 30 } });
    }
    return res.json({ config });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateESGConfig(req, res) {
  try {
    const { organizationName, environmentalWeight, socialWeight, governanceWeight } = req.body;
    const envW = parseFloat(environmentalWeight);
    const socW = parseFloat(socialWeight);
    const govW = parseFloat(governanceWeight);

    if (Math.round(envW + socW + govW) !== 100) {
      return res.status(400).json({ error: 'Weights must sum to 100%' });
    }

    let config = await prisma.eSGConfig.findFirst();
    if (config) {
      config = await prisma.eSGConfig.update({ where: { id: config.id }, data: { organizationName: organizationName || config.organizationName, environmentalWeight: envW, socialWeight: socW, governanceWeight: govW } });
    } else {
      config = await prisma.eSGConfig.create({ data: { organizationName: organizationName || 'EcoSphere', environmentalWeight: envW, socialWeight: socW, governanceWeight: govW } });
    }
    return res.json({ config, message: 'ESG configuration updated' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getCategories(req, res) {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    const [categories, total] = await Promise.all([
      prisma.category.findMany({ where, orderBy: { name: 'asc' }, skip, take: parseInt(limit) }),
      prisma.category.count({ where }),
    ]);
    return res.json({ categories, pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createCategory(req, res) {
  try {
    const { name, type, status } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Name and type are required' });
    if (!['CSR_ACTIVITY', 'CHALLENGE'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
    const existing = await prisma.category.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, type } });
    if (existing) return res.status(409).json({ error: 'Category already exists' });
    const category = await prisma.category.create({ data: { name, type, status: status || 'active' } });
    return res.status(201).json({ category });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    const category = await prisma.category.update({ where: { id }, data: { name: name || existing.name, status: status || existing.status } });
    return res.json({ category });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { csrActivities: true, challenges: true } } } });
    if (!existing) return res.status(404).json({ error: 'Category not found' });
    if (existing._count.csrActivities > 0 || existing._count.challenges > 0) return res.status(400).json({ error: 'Cannot delete category with linked data' });
    await prisma.category.delete({ where: { id } });
    return res.json({ message: 'Category deleted' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
