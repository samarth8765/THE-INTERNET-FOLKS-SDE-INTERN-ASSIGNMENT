import { Request, Response } from "express";
import { memberSchema } from "../utils/schema";
import { DBClient } from "../utils/prisma";
import { generateSnowFlakeId } from "../utils/snowflake";

const db = DBClient.getInstance();

export const addMember = async (req: Request, res: Response) => {
  try {
    const { community, user, role } = req.body;
    const validation = memberSchema.safeParse(req.body);

    if (!validation.success) {
      const error = validation.error;
      return res.status(400).json({
        status: false,
        error: error,
      });
    }

    //@ts-ignore
    const userId = req.data.user.id;
    const adminRole = await db.role.findUnique({
      where: { name: "Community Admin" },
    });

    const isAdmin = await db.member.findFirst({
      where: {
        communityId: community,
        userId,
        roleId: adminRole?.id,
      },
    });

    if (!isAdmin) {
      return res.status(403).json({
        status: false,
        error: "NOT_ALLOWED_ACCESS",
      });
    }

    // Check if the user is already a member of the community
    const isAlreadyMember = await db.member.findFirst({
      where: {
        communityId: community,
        userId: user,
      },
    });

    if (isAlreadyMember) {
      return res.status(409).json({
        status: false,
        error: "User is already a member of the community",
      });
    }

    // Add the user as a member
    const member = await db.member.create({
      data: {
        id: generateSnowFlakeId(),
        communityId: community,
        userId: user,
        roleId: role,
      },
    });

    return res.status(201).json({
      status: true,
      content: {
        data: {
          id: member.id,
          community: member.communityId,
          user: member.userId,
          role: member.roleId,
          created_at: member.createdAt,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //@ts-ignore
    const userId = req.data.user.id;

    const memberToRemove = await db.member.findUnique({
      where: { id },
      include: { community: true },
    });

    if (!memberToRemove) {
      return res.status(404).json({
        status: false,
        error: "Member not found",
      });
    }

    const adminRole = await db.role.findUnique({
      where: { name: "Community Admin" },
    });
    const moderatorRole = await db.role.findUnique({
      where: { name: "Community Moderator" },
    });

    const isAuthorized = await db.member.findFirst({
      where: {
        communityId: memberToRemove.communityId,
        userId,
        roleId: { in: [adminRole!.id, moderatorRole!.id] },
      },
    });

    if (!isAuthorized) {
      return res.status(403).json({
        status: false,
        error: "NOT_ALLOWED_ACCESS",
      });
    }

    await db.member.delete({ where: { id } });

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};
