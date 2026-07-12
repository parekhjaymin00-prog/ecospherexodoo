import prisma from '../prisma/client.js';

// GET /api/dashboard/scores
export async function getDashboardScores(req, res) {
  try {
    // Get ESG config for weights
    let config = await prisma.eSGConfig.findFirst();
    if (!config) {
      config = {
        environmentalWeight: 40,
        socialWeight: 30,
        governanceWeight: 30,
      };
    }

    // Get the latest department scores
    const scores = await prisma.departmentScore.findMany({
      orderBy: { scoredAt: 'desc' },
      take: 50,
      include: { department: { select: { name: true, code: true } } },
    });

    // Calculate aggregate scores
    let environmentalAvg = 0;
    let socialAvg = 0;
    let governanceAvg = 0;

    if (scores.length > 0) {
      environmentalAvg = scores.reduce((sum, s) => sum + s.environmentalScore, 0) / scores.length;
      socialAvg = scores.reduce((sum, s) => sum + s.socialScore, 0) / scores.length;
      governanceAvg = scores.reduce((sum, s) => sum + s.governanceScore, 0) / scores.length;
    }

    const overallScore =
      (environmentalAvg * config.environmentalWeight +
        socialAvg * config.socialWeight +
        governanceAvg * config.governanceWeight) / 100;

    return res.json({
      environmental: Math.round(environmentalAvg * 10) / 10,
      social: Math.round(socialAvg * 10) / 10,
      governance: Math.round(governanceAvg * 10) / 10,
      overall: Math.round(overallScore * 10) / 10,
      weights: {
        environmental: config.environmentalWeight,
        social: config.socialWeight,
        governance: config.governanceWeight,
      },
    });
  } catch (error) {
    console.error('Dashboard scores error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/dashboard/trend
export async function getDashboardTrend(req, res) {
  try {
    // Get scores grouped by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const scores = await prisma.departmentScore.findMany({
      where: { scoredAt: { gte: sixMonthsAgo } },
      orderBy: { scoredAt: 'asc' },
    });

    // Group by month
    const monthlyData = {};
    scores.forEach((score) => {
      const month = score.scoredAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { environmental: [], social: [], governance: [] };
      }
      monthlyData[month].environmental.push(score.environmentalScore);
      monthlyData[month].social.push(score.socialScore);
      monthlyData[month].governance.push(score.governanceScore);
    });

    const trend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      environmental: Math.round((data.environmental.reduce((a, b) => a + b, 0) / data.environmental.length) * 10) / 10,
      social: Math.round((data.social.reduce((a, b) => a + b, 0) / data.social.length) * 10) / 10,
      governance: Math.round((data.governance.reduce((a, b) => a + b, 0) / data.governance.length) * 10) / 10,
    }));

    return res.json({ trend });
  } catch (error) {
    console.error('Dashboard trend error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
