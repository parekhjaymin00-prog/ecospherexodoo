import prisma from '../prisma/client.js';

// GET /api/environmental-goals
export async function getEnvironmentalGoals(req, res) {
  try {
    const { search, status, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const orderBy = {};
    orderBy[sort] = order;

    const [goals, total] = await Promise.all([
      prisma.environmentalGoal.findMany({ where, orderBy, skip, take }),
      prisma.environmentalGoal.count({ where }),
    ]);

    return res.json({
      goals,
      pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Get environmental goals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/environmental-goals/stats
export async function getGoalStats(req, res) {
  try {
    const [total, active, completed, missed] = await Promise.all([
      prisma.environmentalGoal.count(),
      prisma.environmentalGoal.count({ where: { status: 'active' } }),
      prisma.environmentalGoal.count({ where: { status: 'completed' } }),
      prisma.environmentalGoal.count({ where: { status: 'missed' } }),
    ]);

    const goals = await prisma.environmentalGoal.findMany({ where: { status: 'active' } });
    let avgProgress = 0;
    if (goals.length > 0) {
      const totalProgress = goals.reduce((sum, g) => {
        const progress = g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0;
        return sum + Math.min(progress, 100);
      }, 0);
      avgProgress = Math.round(totalProgress / goals.length);
    }

    return res.json({ total, active, completed, missed, avgProgress });
  } catch (error) {
    console.error('Get goal stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/environmental-goals/:id
export async function getEnvironmentalGoalById(req, res) {
  try {
    const goal = await prisma.environmentalGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });
    return res.json({ goal });
  } catch (error) {
    console.error('Get environmental goal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/environmental-goals
export async function createEnvironmentalGoal(req, res) {
  try {
    const { title, description, targetValue, currentValue, unit, startDate, endDate, status } = req.body;
    if (!title || !targetValue || !unit || !startDate || !endDate) {
      return res.status(400).json({ error: 'Title, targetValue, unit, startDate, and endDate are required' });
    }

    const goal = await prisma.environmentalGoal.create({
      data: {
        title,
        description: description || null,
        targetValue: parseFloat(targetValue),
        currentValue: parseFloat(currentValue) || 0,
        unit,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'active',
      },
    });

    return res.status(201).json({ goal });
  } catch (error) {
    console.error('Create environmental goal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/environmental-goals/:id
export async function updateEnvironmentalGoal(req, res) {
  try {
    const { id } = req.params;
    const { title, description, targetValue, currentValue, unit, startDate, endDate, status } = req.body;

    const existing = await prisma.environmentalGoal.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    const updatedCurrentValue = currentValue !== undefined ? parseFloat(currentValue) : existing.currentValue;
    const updatedTargetValue = targetValue !== undefined ? parseFloat(targetValue) : existing.targetValue;

    let newStatus = status || existing.status;
    if (updatedCurrentValue >= updatedTargetValue && newStatus === 'active') {
      newStatus = 'completed';
    }

    const goal = await prisma.environmentalGoal.update({
      where: { id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        targetValue: updatedTargetValue,
        currentValue: updatedCurrentValue,
        unit: unit || existing.unit,
        startDate: startDate ? new Date(startDate) : existing.startDate,
        endDate: endDate ? new Date(endDate) : existing.endDate,
        status: newStatus,
      },
    });

    return res.json({ goal });
  } catch (error) {
    console.error('Update environmental goal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/environmental-goals/:id
export async function deleteEnvironmentalGoal(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.environmentalGoal.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Goal not found' });

    await prisma.environmentalGoal.delete({ where: { id } });
    return res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete environmental goal error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
