import { put, get, del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const PROJECTS_KEY = 'portfolio/projects.json';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // GET - Fetch all projects
  if (req.method === 'GET') {
    try {
      const blob = await get(PROJECTS_KEY);
      if (!blob) {
        return res.status(200).json([]);
      }
      const response = await fetch(blob.url);
      const projects = await response.json();
      return res.status(200).json(projects);
    } catch (error) {
      return res.status(200).json([]);
    }
  }
  
  // POST - Save all projects
  if (req.method === 'POST') {
    try {
      const { projects } = req.body;
      await put(PROJECTS_KEY, JSON.stringify(projects), {
        access: 'public',
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Save error:', error);
      return res.status(500).json({ error: 'Failed to save projects' });
    }
  }
  
  res.status(405).json({ error: 'Method not allowed' });
}
