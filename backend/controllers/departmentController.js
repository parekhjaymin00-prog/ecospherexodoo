import prisma from '../prisma/client.js';

// GET /api/departments
export async function getDepartments(req, res) {
  try {
    const { search, status, sort = 'name', order = 'asc', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const orderBy = {};
    orderBy[sort] = order;

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          head: { select: { id: true, fullName: true, email: true } },
          parent: { select: { id: true, name: true, code: true } },
          _count: { select: { children: true, employees: true } },
        },
      }),
      prisma.department.count({ where }),
    ]);

    return res.json({
      departments,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Get departments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/departments/stats
export async function getDepartmentStats(req, res) {
  try {
    const [total, active, inactive, totalEmployees] = await Promise.all([
      prisma.department.count(),
      prisma.department.count({ where: { status: 'active' } }),
      prisma.department.count({ where: { status: 'inactive' } }),
      prisma.department.aggregate({ _sum: { employeeCount: true } }),
    ]);

    return res.json({
      total,
      active,
      inactive,
      totalEmployees: totalEmployees._sum.employeeCount || 0,
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/departments/all (no pagination, for dropdowns)
export async function getAllDepartments(req, res) {
  try {
    const departments = await prisma.department.findMany({
      where: { status: 'active' },
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
    return res.json({ departments });
  } catch (error) {
    console.error('Get all departments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/departments/:id
export async function getDepartmentById(req, res) {
  try {
    const { id } = req.params;
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        head: { select: { id: true, fullName: true, email: true } },
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true, status: true, employeeCount: true } },
        departmentScores: { orderBy: { scoredAt: 'desc' }, take: 1 },
        _count: { select: { employees: true, csrActivities: true } },
      },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    return res.json({ department });
  } catch (error) {
    console.error('Get department by id error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/departments
export async function createDepartment(req, res) {
  try {
    const { name, code, headId, parentId, employeeCount, status } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'Name and code are required' });
    }

    const existing = await prisma.department.findUnique({ where: { code } });
    if (existing) {
      return res.status(409).json({ error: 'Department code already exists' });
    }

    const department = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        headId: headId || null,
        parentId: parentId || null,
        employeeCount: parseInt(employeeCount) || 0,
        status: status || 'active',
      },
      include: {
        head: { select: { id: true, fullName: true, email: true } },
        parent: { select: { id: true, name: true, code: true } },
      },
    });

    return res.status(201).json({ department });
  } catch (error) {
    console.error('Create department error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// PUT /api/departments/:id
export async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name, code, headId, parentId, employeeCount, status } = req.body;

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Department not found' });
    }

    if (code && code.toUpperCase() !== existing.code) {
      const duplicate = await prisma.department.findUnique({ where: { code: code.toUpperCase() } });
      if (duplicate) {
        return res.status(409).json({ error: 'Department code already exists' });
      }
    }

    if (parentId === id) {
      return res.status(400).json({ error: 'Department cannot be its own parent' });
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name: name || existing.name,
        code: code ? code.toUpperCase() : existing.code,
        headId: headId !== undefined ? (headId || null) : existing.headId,
        parentId: parentId !== undefined ? (parentId || null) : existing.parentId,
        employeeCount: employeeCount !== undefined ? parseInt(employeeCount) : existing.employeeCount,
        status: status || existing.status,
      },
      include: {
        head: { select: { id: true, fullName: true, email: true } },
        parent: { select: { id: true, name: true, code: true } },
      },
    });

    return res.json({ department });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// DELETE /api/departments/:id
export async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { employees: true, children: true } } },
    });

    if (!department) {
      return res.status(404).json({ error: 'Department not found' });
    }

    if (department._count.employees > 0) {
      return res.status(400).json({ error: 'Cannot delete department with assigned employees' });
    }

    if (department._count.children > 0) {
      return res.status(400).json({ error: 'Cannot delete department with child departments' });
    }

    await prisma.departmentScore.deleteMany({ where: { departmentId: id } });
    await prisma.department.delete({ where: { id } });

    return res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
