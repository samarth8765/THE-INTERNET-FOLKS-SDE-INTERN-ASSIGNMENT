import { Request, Response } from "express";
import { roleSchema } from "../utils/schema";
import { DBClient } from "../utils/prisma";
import { generateSnowFlakeId } from "../utils/snowflake";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const db = DBClient.getInstance();

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const validation = roleSchema.safeParse(req.body);

    if (!validation.success) {
      const error = validation.error;
      return res.status(400).json({ status: false, error: error });
    }

    const role = await db.role.create({
      data: {
        name,
        id: generateSnowFlakeId(),
      },
    });

    const responseBody = {
      status: true,
      content: {
        data: {
          id: role.id,
          name: role.name,
          created_at: role.createdAt,
          updated_at: role.updatedAt,
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

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    const { page = 1 } = req.query;
    const limit = 10;

    const total = await db.role.count();
    const totalPages = Math.ceil(total / limit);

    if (Number(page) > totalPages) {
      return res.status(404).json({ status: false, error: "Roles Not Found" });
    }

    const roles = await db.role.findMany({
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
          total,
          pages: totalPages,
          page: Number(page),
        },
        data: roles.map((role) => ({
          id: role.id,
          name: role.name,
          created_at: role.createdAt,
          updated_at: role.updatedAt,
        })),
      },
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error" });
  }
};
