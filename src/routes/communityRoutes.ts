import { Router } from "express";
import {
  createCommunity,
  getAllCommunities,
  getAllMembers,
  getMyJoinedCommunities,
  getMyOwnedCommunities,
} from "../controllers/communityController";
import { authMiddleware } from "../middlewares/authMiddleware";

const communityRouter = Router();

communityRouter.get("/", getAllCommunities);
communityRouter.get("/:id/members", getAllMembers);
communityRouter.get("/me/owner", authMiddleware, getMyOwnedCommunities);
communityRouter.get("/me/member", authMiddleware, getMyJoinedCommunities);
communityRouter.post("/", authMiddleware, createCommunity);

export { communityRouter };
