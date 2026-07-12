import prisma from '../prisma/client.js';

// GET /api/emission-factors
export async function getEmissionFactors(req, res) {
  try {
    const { search, category, page = 1, limit = 10, sort = 'name', order = 'asc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const orderBy = {};
    orderBy[sort] = order;

    const [factors, total] = await Promise.all([
      prisma.emissionFactor.findMany({ where, orderBy, skip, take }),
      prisma.emissionFactor.count({ where }),
    ]);

    return res.json({
      factors,
      pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Get emission factors error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/emission-factors/all
export async function getAllEmissionFactors(req, res) {
  try {
    const factors = await prisma.emissionFactor.findMany({
      select: { id: true, name: true, category: true, unit: true, factor: true },
      orderBy: { name: 'asc' },
    });
    return res.json({ factors });
  } catch (error) {
    console.error('Get all emission factors error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/emission-factors/:id
export async function getEmissionFactorById(req, res) {
  try {
    const factor = await prisma.emissionFactor.findUnique({ where: { id: req.params.id } });
    if (!factor) return res.status(404).json({ error: 'Emission factor not found' });
    return res.json({ factor });
  } catch (error) {
    console.error('Get emission factor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/emission-factors
export async function createEmissionFactor(req, res) {
  try {
    const { name, category, unit, factor, source, year, description } = req.body;
    if (!name || !category || !unit || factor === undefined || !year) {
      return res.status(400).json({ error: 'Name, category, unit, factor, and year are required' });
    }

    const existing = await prisma.emissionFactor.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, category: { equals: category, mode: 'insensitive' }, year: parseInt(year) },
    });
    if (existing) {
      return res.status(409).json({ error: 'Emission factor with same name, category and year already exists' });
    }

    const created = await prisma.emissionFactor.create({
      data: { name, category, unit, factor: parseFloat(factor), source: source || null, year: parseInt(year), description: description || null },
    });
    return res.status(201).json({ factor: created });
  } catch (error) {
    console.error('Create emission factor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/emission-factors/:id
export async function updateEmissionFactor(req, res) {
  try {
    const { id } = req.params;
    const { name, category, unit, factor, source, year, description } = req.body;

    const existing = await prisma.emissionFactor.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Emission factor not found' });

    const updated = await prisma.emissionFactor.update({
      where: { id },
      data: {
        name: name || existing.name,
        category: category || existing.category,
        unit: unit || existing.unit,
        factor: factor !== undefined ? parseFloat(factor) : existing.factor,
        source: source !== undefined ? source : existing.source,
        year: year ? parseInt(year) : existing.year,
        description: description !== undefined ? description : existing.description,
      },
    });
    return res.json({ factor: updated });
  } catch (error) {
    console.error('Update emission factor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/emission-factors/:id
export async function deleteEmissionFactor(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.emissionFactor.findUnique({
      where: { id },
      include: { _count: { select: { carbonTransactions: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'Emission factor not found' });
    if (existing._count.carbonTransactions > 0) {
      return res.status(400).json({ error: 'Cannot delete emission factor with linked transactions' });
    }

    await prisma.emissionFactor.delete({ where: { id } });
    return res.json({ message: 'Emission factor deleted successfully' });
  } catch (error) {
    console.error('Delete emission factor error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
