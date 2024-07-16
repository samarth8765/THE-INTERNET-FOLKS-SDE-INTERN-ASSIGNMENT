import { Router } from "express";
import { signin, signup, userInfo } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const authRouter = Router();

authRouter.post("/signin", signin);
authRouter.post("/signup", signup);
authRouter.get("/me", authMiddleware, userInfo);

export { authRouter };
