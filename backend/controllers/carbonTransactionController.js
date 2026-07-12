import prisma from '../prisma/client.js';

// GET /api/carbon-transactions
export async function getCarbonTransactions(req, res) {
  try {
    const { search, scope, startDate, endDate, page = 1, limit = 10, sort = 'transactionDate', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.description = { contains: search, mode: 'insensitive' };
    }
    if (scope) {
      where.scope = parseInt(scope);
    }
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const orderBy = {};
    orderBy[sort] = order;

    const [transactions, total] = await Promise.all([
      prisma.carbonTransaction.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          user: { select: { id: true, fullName: true } },
          emissionFactor: { select: { id: true, name: true, category: true, unit: true, factor: true } },
        },
      }),
      prisma.carbonTransaction.count({ where }),
    ]);

    return res.json({
      transactions,
      pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Get carbon transactions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/carbon-transactions/stats
export async function getCarbonStats(req, res) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalResult, monthlyResult, countResult] = await Promise.all([
      prisma.carbonTransaction.aggregate({ _sum: { emissionAmount: true } }),
      prisma.carbonTransaction.aggregate({
        _sum: { emissionAmount: true },
        where: { transactionDate: { gte: startOfMonth } },
      }),
      prisma.carbonTransaction.count(),
    ]);

    const total = totalResult._sum.emissionAmount || 0;
    const monthly = monthlyResult._sum.emissionAmount || 0;
    const average = countResult > 0 ? total / countResult : 0;

    return res.json({
      totalCarbon: Math.round(total * 100) / 100,
      monthlyCarbon: Math.round(monthly * 100) / 100,
      averageCarbon: Math.round(average * 100) / 100,
      totalTransactions: countResult,
    });
  } catch (error) {
    console.error('Get carbon stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/carbon-transactions/trend
export async function getCarbonTrend(req, res) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const transactions = await prisma.carbonTransaction.findMany({
      where: { transactionDate: { gte: sixMonthsAgo } },
      orderBy: { transactionDate: 'asc' },
    });

    const monthlyData = {};
    transactions.forEach((t) => {
      const month = t.transactionDate.toISOString().slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = 0;
      monthlyData[month] += t.emissionAmount;
    });

    const trend = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      emissions: Math.round(amount * 100) / 100,
    }));

    return res.json({ trend });
  } catch (error) {
    console.error('Get carbon trend error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/carbon-transactions/by-scope
export async function getCarbonByScope(req, res) {
  try {
    const results = await prisma.carbonTransaction.groupBy({
      by: ['scope'],
      _sum: { emissionAmount: true },
      _count: true,
    });

    const byScope = results.map((r) => ({
      scope: r.scope,
      total: Math.round((r._sum.emissionAmount || 0) * 100) / 100,
      count: r._count,
    }));

    return res.json({ byScope });
  } catch (error) {
    console.error('Get carbon by scope error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/carbon-transactions
export async function createCarbonTransaction(req, res) {
  try {
    const { description, quantity, unit, emissionFactorId, scope, transactionDate } = req.body;

    if (!quantity || !unit || !emissionFactorId || !scope || !transactionDate) {
      return res.status(400).json({ error: 'Quantity, unit, emissionFactorId, scope, and transactionDate are required' });
    }

    const factor = await prisma.emissionFactor.findUnique({ where: { id: emissionFactorId } });
    if (!factor) return res.status(404).json({ error: 'Emission factor not found' });

    const emissionAmount = parseFloat(quantity) * factor.factor;

    const transaction = await prisma.carbonTransaction.create({
      data: {
        description: description || null,
        quantity: parseFloat(quantity),
        unit,
        emissionAmount,
        scope: parseInt(scope),
        transactionDate: new Date(transactionDate),
        userId: req.user.id,
        emissionFactorId,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        emissionFactor: { select: { id: true, name: true, category: true, unit: true, factor: true } },
      },
    });

    return res.status(201).json({ transaction });
  } catch (error) {
    console.error('Create carbon transaction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/carbon-transactions/:id
export async function updateCarbonTransaction(req, res) {
  try {
    const { id } = req.params;
    const { description, quantity, unit, emissionFactorId, scope, transactionDate } = req.body;

    const existing = await prisma.carbonTransaction.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    let emissionAmount = existing.emissionAmount;
    const factorId = emissionFactorId || existing.emissionFactorId;
    const qty = quantity !== undefined ? parseFloat(quantity) : existing.quantity;

    if (quantity !== undefined || emissionFactorId) {
      const factor = await prisma.emissionFactor.findUnique({ where: { id: factorId } });
      if (!factor) return res.status(404).json({ error: 'Emission factor not found' });
      emissionAmount = qty * factor.factor;
    }

    const updated = await prisma.carbonTransaction.update({
      where: { id },
      data: {
        description: description !== undefined ? description : existing.description,
        quantity: qty,
        unit: unit || existing.unit,
        emissionAmount,
        scope: scope ? parseInt(scope) : existing.scope,
        transactionDate: transactionDate ? new Date(transactionDate) : existing.transactionDate,
        emissionFactorId: factorId,
      },
      include: {
        user: { select: { id: true, fullName: true } },
        emissionFactor: { select: { id: true, name: true, category: true, unit: true, factor: true } },
      },
    });

    return res.json({ transaction: updated });
  } catch (error) {
    console.error('Update carbon transaction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/carbon-transactions/:id
export async function deleteCarbonTransaction(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.carbonTransaction.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Transaction not found' });

    await prisma.carbonTransaction.delete({ where: { id } });
    return res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete carbon transaction error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
