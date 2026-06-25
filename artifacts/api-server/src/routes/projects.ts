import { Router, type IRouter, type Request, type Response } from "express";
import { eq, sql, desc, count } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import {
  CreateProjectBody,
  GetProjectParams,
  DeleteProjectParams,
  ListProjectsQueryParams,
} from "@workspace/api-zod";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

// GET /projects - list all projects, optionally filtered by category
router.get("/projects", async (req: Request, res: Response) => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  const category = parsed.success ? parsed.data.category : undefined;

  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(category ? eq(projectsTable.category, category) : undefined)
      .orderBy(desc(projectsTable.createdAt));

    res.json(
      projects.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
      })),
    );
  } catch (error) {
    req.log.error({ err: error }, "Error listing projects");
    res.status(500).json({ error: "Failed to list projects" });
  }
});

// POST /projects - create a new project (admin only)
router.post("/projects", async (req: Request, res: Response) => {
  // Check admin session cookie
  if (!req.cookies?.["admin_session"]) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { title, category, description, objectPath } = parsed.data;

  if (!["Graphics", "Product Design"].includes(category)) {
    res.status(400).json({ error: "Invalid category" });
    return;
  }

  try {
    const [project] = await db
      .insert(projectsTable)
      .values({ title, category, description, objectPath })
      .returning();

    res.status(201).json({ ...project, createdAt: project.createdAt.toISOString() });
  } catch (error) {
    req.log.error({ err: error }, "Error creating project");
    res.status(500).json({ error: "Failed to create project" });
  }
});

// GET /projects/stats - portfolio statistics
router.get("/projects/stats", async (req: Request, res: Response) => {
  try {
    const [totalResult, graphicsResult, productDesignResult] = await Promise.all([
      db.select({ count: count() }).from(projectsTable),
      db
        .select({ count: count() })
        .from(projectsTable)
        .where(eq(projectsTable.category, "Graphics")),
      db
        .select({ count: count() })
        .from(projectsTable)
        .where(eq(projectsTable.category, "Product Design")),
    ]);

    const recent = await db
      .select()
      .from(projectsTable)
      .orderBy(desc(projectsTable.createdAt))
      .limit(3);

    res.json({
      total: totalResult[0].count,
      graphics: graphicsResult[0].count,
      productDesign: productDesignResult[0].count,
      recent: recent.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    });
  } catch (error) {
    req.log.error({ err: error }, "Error fetching project stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /projects/:id - get a single project
router.get("/projects/:id", async (req: Request, res: Response) => {
  const parsed = GetProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, parsed.data.id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json({ ...project, createdAt: project.createdAt.toISOString() });
  } catch (error) {
    req.log.error({ err: error }, "Error fetching project" );
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// DELETE /projects/:id - delete a project and its image (admin only)
router.delete("/projects/:id", async (req: Request, res: Response) => {
  if (!req.cookies?.["admin_session"]) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = DeleteProjectParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, parsed.data.id));

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Delete from DB first
    await db.delete(projectsTable).where(eq(projectsTable.id, parsed.data.id));

    // Attempt to delete the image from object storage (best-effort)
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(project.objectPath);
      await objectFile.delete();
    } catch (storageErr) {
      // Log but don't fail if image deletion fails
      req.log.warn({ err: storageErr }, "Could not delete object from storage");
    }

    res.status(204).send();
  } catch (error) {
    req.log.error({ err: error }, "Error deleting project");
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
