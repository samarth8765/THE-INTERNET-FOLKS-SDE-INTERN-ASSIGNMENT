import { Request, Response } from "express";
import { communitySchema } from "../utils/schema";
import slugify from "slugify";
import { DBClient } from "../utils/prisma";
import { generateSnowFlakeId } from "../utils/snowflake";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const db = DBClient.getInstance();

export const createCommunity = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const validation = communitySchema.safeParse(req.body);

    if (!validation.success) {
      const error = validation.error;
      return res.status(400).json({
        status: false,
        error: error,
      });
    }

    //@ts-ignore
    const userId = req.data.user.id;
    // Generate slug from name
    const slug = slugify(name, { lower: true });

    const community = await db.community.create({
      data: {
        id: generateSnowFlakeId(),
        name,
        slug,
        ownerId: userId,
      },
    });

    // Check if the "Community Admin" role exists, if not, create it
    let adminRole = await db.role.findUnique({
      where: { name: "Community Admin" },
    });

    if (!adminRole) {
      adminRole = await db.role.create({
        data: {
          id: generateSnowFlakeId(),
          name: "Community Admin",
        },
      });
    }

    // Add the user as the first member with the Community Admin role
    await db.member.create({
      data: {
        id: generateSnowFlakeId(),
        communityId: community.id,
        roleId: adminRole.id,
        userId: userId,
      },
    });

    const responseBody = {
      status: true,
      content: {
        data: {
          id: community.id,
          name: name,
          slug: slug,
          owner: userId,
          created_at: community.createdAt,
          updated_at: community.updatedAt,
        },
      },
    };

    return res.status(201).json(responseBody);
  } catch (error) {
    console.log(error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          status: false,
          error: "Role name already exists",
        });
      }
    }
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};

export const getAllCommunities = async (req: Request, res: Response) => {
  try {
    const { page = 1 } = req.query;
    const limit = 10;

    const total = await db.community.count();
    const totalPages = Math.ceil(total / limit);

    if (total === 0 || Number(page) > totalPages) {
      return res.status(404).json({
        status: false,
        error: "Not Communities Found",
      });
    }

    const communities = await db.community.findMany({
      skip: (Number(page) - 1) * limit,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const responseBody = {
      status: true,
      content: {
        meta: {
          total: total,
          pages: totalPages,
          page: Number(page),
        },
        data: communities.map((community) => ({
          id: community.id,
          name: community.name,
          slug: community.slug,
          owner: {
            id: community.ownerId,
            name: community.owner.name,
          },
          created_at: community.createdAt,
          updated_at: community.updatedAt,
        })),
      },
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

export const getAllMembers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    const limit = 10;

    const total = await db.member.count({ where: { communityId: id } });
    const totalPages = Math.ceil(total / limit);

    if (total === 0 || Number(page) > totalPages) {
      return res.status(404).json({
        status: false,
        error: "Not Members Found",
      });
    }

    const members = await db.member.findMany({
      where: { communityId: id },
      skip: (Number(page) - 1) * limit,
      take: limit,
      include: {
        user: {
          select: { id: true, name: true },
        },
        role: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const responseBody = {
      status: true,
      content: {
        meta: {
          total: total,
          pages: totalPages,
          page: Number(page),
        },
        data: members.map((member) => ({
          id: member.id,
          community: member.communityId,
          user: {
            id: member.userId,
            name: member.user.name,
          },
          role: {
            id: member.roleId,
            name: member.role.name,
          },
          created_at: member.createdAt,
        })),
      },
    };
    return res.status(200).json(responseBody);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

export const getMyOwnedCommunities = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const id = req.data.user.id;
    const limit = 10;
    const { page = 1 } = req.query;

    const total = await db.community.count({
      where: { ownerId: id },
    });

    const totalPages = Math.ceil(total / limit);

    if (total === 0 || Number(page) > totalPages) {
      return res.status(404).json({
        status: false,
        error: "Not Communities Found",
      });
    }

    const communities = await db.community.findMany({
      where: {
        ownerId: id,
      },
      skip: (Number(page) - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "asc",
      },
    });

    const responseBody = {
      status: true,
      content: {
        meta: {
          total: total,
          pages: totalPages,
          page: Number(page),
        },
        data: communities,
      },
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

export const getMyJoinedCommunities = async (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const id = req.data.user.id;
    const limit = 10;
    const { page = 1 } = req.query;

    const total = await db.member.count({
      where: { userId: id },
    });
    const totalPages = Math.ceil(total / limit);

    if (total === 0 || Number(page) > totalPages) {
      return res.status(404).json({
        status: false,
        error: "Not Communities Found",
      });
    }

    const members = await db.member.findMany({
      where: { userId: id },
      skip: (Number(page) - 1) * limit,
      take: limit,
      include: {
        community: {
          include: {
            owner: {
              select: { name: true, id: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const responseBody = {
      status: true,
      content: {
        meta: {
          total: total,
          pages: totalPages,
          page: Number(page),
        },
        data: members.map((member) => ({
          id: member.community.id,
          name: member.community.name,
          slug: member.community.slug,
          owner: {
            id: member.community.ownerId,
            name: member.community.owner.name,
          },
          created_at: member.community.createdAt,
          updated_at: member.community.updatedAt,
        })),
      },
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
