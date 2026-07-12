import prisma from '../prisma/client.js';

export async function getLeaderboard(req, res) {
  try {
    // Get all users with their total XP from challenge participations + points from CSR
    const users = await prisma.user.findMany({
      select: {
        id: true, fullName: true, email: true, department: { select: { id: true, name: true } },
        challengeParticipations: { where: { approvalStatus: 'approved' }, select: { xpAwarded: true } },
        employeeParticipations: { where: { approvalStatus: 'approved' }, select: { pointsEarned: true } },
      },
    });

    const leaderboard = users.map((u) => {
      const xp = u.challengeParticipations.reduce((sum, p) => sum + p.xpAwarded, 0);
      const points = u.employeeParticipations.reduce((sum, p) => sum + p.pointsEarned, 0);
      return { id: u.id, fullName: u.fullName, department: u.department, xp, points, totalScore: xp + points };
    }).sort((a, b) => b.totalScore - a.totalScore).slice(0, 50);

    return res.json({ leaderboard });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getDepartmentLeaderboard(req, res) {
  try {
    const departments = await prisma.department.findMany({
      where: { status: 'active' },
      include: { departmentScores: { orderBy: { scoredAt: 'desc' }, take: 1 } },
    });

    const leaderboard = departments.map((d) => ({
      id: d.id, name: d.name, code: d.code,
      score: d.departmentScores[0]?.totalScore || 0,
      environmental: d.departmentScores[0]?.environmentalScore || 0,
      social: d.departmentScores[0]?.socialScore || 0,
      governance: d.departmentScores[0]?.governanceScore || 0,
    })).sort((a, b) => b.score - a.score);

    return res.json({ leaderboard });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
