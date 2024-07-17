import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { addMember, deleteMember } from "../controllers/memberController";

const memberRouter = Router();

memberRouter.post("/", authMiddleware, addMember);
memberRouter.delete("/:id", authMiddleware, deleteMember);

export { memberRouter };
