import { Request, Response } from "express";
import { DBClient } from "../utils/prisma";
import { compare, hash } from "bcrypt";
import { generateSnowFlakeId } from "../utils/snowflake";
import { sign } from "jsonwebtoken";
import { signInSchema, signUpSchema } from "../utils/schema";

const db = DBClient.getInstance();

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const validation = signUpSchema.safeParse(req.body);
    if (!validation.success) {
      const error = validation.error;
      return res.status(400).json({
        status: false,
        error: error,
      });
    }

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        error: "Email already exists",
      });
    }

    const hashPassword = await hash(password, 10);

    const user = await db.user.create({
      data: {
        id: generateSnowFlakeId(),
        email,
        name,
        password: hashPassword,
      },
    });

    const token = sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const responseBody = {
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.createdAt,
        },
        meta: {
          access_token: token,
        },
      },
    };

    return res.status(201).json(responseBody);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const validation = signInSchema.safeParse(req.body);
    if (!validation.success) {
      const error = validation.error;
      return res.status(400).json({
        status: false,
        error: error,
      });
    }

    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: false,
        error: "User not found",
      });
    }

    const validatePassword = await compare(password, user.password);
    if (!validatePassword) {
      return res.status(403).json({
        status: false,
        error: "Invalid credentials",
      });
    }

    const token = sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const responseBody = {
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.createdAt,
        },
        meta: {
          access_token: token,
        },
      },
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};

export const userInfo = (req: Request, res: Response) => {
  try {
    //@ts-ignore
    const { data } = req;
    const responseBody = {
      status: true,
      content: {
        data: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          created_at: data.user.createdAt,
        },
      },
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};
