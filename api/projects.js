export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // For now, return mock data
      const projects = [
        {
          id: 1,
          title: "Brand Identity System",
          category: "Graphics",
          description: "Complete brand identity for a tech startup.",
          imageUrl: "https://picsum.photos/id/20/800/600",
          files: [],
          createdAt: Date.now()
        }
      ];
      return res.status(200).json(projects);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { projects } = req.body;
      // For now, just return success
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to save projects' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
