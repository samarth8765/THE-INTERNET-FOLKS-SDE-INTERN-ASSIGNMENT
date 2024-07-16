import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createRole, getAllRoles } from "../controllers/roleController";

const routeRouter = Router();

routeRouter.post("/", createRole);
routeRouter.get("/", getAllRoles);

export { routeRouter };
