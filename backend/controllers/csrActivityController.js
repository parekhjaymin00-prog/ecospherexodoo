import prisma from '../prisma/client.js';

// GET /api/csr-activities
export async function getCSRActivities(req, res) {
  try {
    const { search, categoryId, departmentId, page = 1, limit = 10, sort = 'startDate', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (departmentId) where.departmentId = departmentId;

    const orderBy = {};
    orderBy[sort] = order;

    const [activities, total] = await Promise.all([
      prisma.cSRActivity.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
          createdBy: { select: { id: true, fullName: true } },
          _count: { select: { participations: true } },
        },
      }),
      prisma.cSRActivity.count({ where }),
    ]);

    return res.json({
      activities,
      pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Get CSR activities error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/csr-activities/stats
export async function getCSRStats(req, res) {
  try {
    const now = new Date();
    const [total, active, completed, totalParticipations] = await Promise.all([
      prisma.cSRActivity.count(),
      prisma.cSRActivity.count({ where: { endDate: { gte: now }, startDate: { lte: now } } }),
      prisma.cSRActivity.count({ where: { endDate: { lt: now } } }),
      prisma.employeeParticipation.count(),
    ]);

    const totalBudget = await prisma.cSRActivity.aggregate({ _sum: { budget: true } });

    return res.json({
      total,
      active,
      completed,
      upcoming: total - active - completed,
      totalParticipations,
      totalBudget: totalBudget._sum.budget || 0,
    });
  } catch (error) {
    console.error('Get CSR stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/csr-activities/:id
export async function getCSRActivityById(req, res) {
  try {
    const activity = await prisma.cSRActivity.findUnique({
      where: { id: req.params.id },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
        participations: {
          include: { user: { select: { id: true, fullName: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!activity) return res.status(404).json({ error: 'CSR activity not found' });
    return res.json({ activity });
  } catch (error) {
    console.error('Get CSR activity error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/csr-activities
export async function createCSRActivity(req, res) {
  try {
    const { title, description, location, startDate, endDate, budget, maxParticipants, categoryId, departmentId } = req.body;
    if (!title || !startDate || !endDate || !categoryId) {
      return res.status(400).json({ error: 'Title, startDate, endDate, and categoryId are required' });
    }

    const activity = await prisma.cSRActivity.create({
      data: {
        title,
        description: description || null,
        location: location || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: budget ? parseFloat(budget) : null,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        categoryId,
        createdById: req.user.id,
        departmentId: departmentId || null,
      },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    return res.status(201).json({ activity });
  } catch (error) {
    console.error('Create CSR activity error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/csr-activities/:id
export async function updateCSRActivity(req, res) {
  try {
    const { id } = req.params;
    const { title, description, location, startDate, endDate, budget, maxParticipants, categoryId, departmentId } = req.body;

    const existing = await prisma.cSRActivity.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'CSR activity not found' });

    const activity = await prisma.cSRActivity.update({
      where: { id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        location: location !== undefined ? location : existing.location,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        budget: budget !== undefined ? (budget ? parseFloat(budget) : null) : existing.budget,
        maxParticipants: maxParticipants !== undefined ? (maxParticipants ? parseInt(maxParticipants) : null) : existing.maxParticipants,
        categoryId: categoryId || existing.categoryId,
        departmentId: departmentId !== undefined ? (departmentId || null) : existing.departmentId,
      },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, fullName: true } },
      },
    });

    return res.json({ activity });
  } catch (error) {
    console.error('Update CSR activity error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/csr-activities/:id
export async function deleteCSRActivity(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.cSRActivity.findUnique({
      where: { id },
      include: { _count: { select: { participations: true } } },
    });
    if (!existing) return res.status(404).json({ error: 'CSR activity not found' });

    await prisma.employeeParticipation.deleteMany({ where: { activityId: id } });
    await prisma.cSRActivity.delete({ where: { id } });
    return res.json({ message: 'CSR activity deleted successfully' });
  } catch (error) {
    console.error('Delete CSR activity error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
