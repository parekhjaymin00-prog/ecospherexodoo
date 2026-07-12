import prisma from '../prisma/client.js';

export async function getProductProfiles(req, res) {
  try {
    const { search, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    const where = {};
    if (search) { where.OR = [{ productName: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }]; }
    const [products, total] = await Promise.all([
      prisma.productESGProfile.findMany({ where, orderBy: { [sort]: order }, skip, take }),
      prisma.productESGProfile.count({ where }),
    ]);
    return res.json({ products, pagination: { total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) } });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function getProductProfileById(req, res) {
  try {
    const product = await prisma.productESGProfile.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function createProductProfile(req, res) {
  try {
    const { productName, description, environmentalScore, socialScore, governanceScore, certifications, sustainableMaterials } = req.body;
    if (!productName) return res.status(400).json({ error: 'productName is required' });
    const envS = parseFloat(environmentalScore) || 0;
    const socS = parseFloat(socialScore) || 0;
    const govS = parseFloat(governanceScore) || 0;
    const overallScore = Math.round(((envS + socS + govS) / 3) * 10) / 10;
    const product = await prisma.productESGProfile.create({ data: { productName, description: description || null, environmentalScore: envS, socialScore: socS, governanceScore: govS, overallScore, certifications: certifications || [], sustainableMaterials: sustainableMaterials || [] } });
    return res.status(201).json({ product });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function updateProductProfile(req, res) {
  try {
    const { id } = req.params;
    const { productName, description, environmentalScore, socialScore, governanceScore, certifications, sustainableMaterials } = req.body;
    const existing = await prisma.productESGProfile.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const envS = environmentalScore !== undefined ? parseFloat(environmentalScore) : existing.environmentalScore;
    const socS = socialScore !== undefined ? parseFloat(socialScore) : existing.socialScore;
    const govS = governanceScore !== undefined ? parseFloat(governanceScore) : existing.governanceScore;
    const overallScore = Math.round(((envS + socS + govS) / 3) * 10) / 10;
    const product = await prisma.productESGProfile.update({ where: { id }, data: { productName: productName || existing.productName, description: description !== undefined ? description : existing.description, environmentalScore: envS, socialScore: socS, governanceScore: govS, overallScore, certifications: certifications !== undefined ? certifications : existing.certifications, sustainableMaterials: sustainableMaterials !== undefined ? sustainableMaterials : existing.sustainableMaterials } });
    return res.json({ product });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}

export async function deleteProductProfile(req, res) {
  try {
    const { id } = req.params;
    await prisma.productESGProfile.delete({ where: { id } });
    return res.json({ message: 'Product profile deleted successfully' });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'Internal server error' }); }
}
