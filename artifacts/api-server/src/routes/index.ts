import { Router, type IRouter } from "express";
import healthRouter from "./health";
import storageRouter from "./storage";
import projectsRouter from "./projects";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(storageRouter);
router.use(projectsRouter);
router.use(adminRouter);

export default router;
