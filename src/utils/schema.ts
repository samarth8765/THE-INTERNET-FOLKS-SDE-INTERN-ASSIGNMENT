import zod from "zod";

export const signUpSchema = zod.object({
  name: zod.string().min(2),
  email: zod.string().email(),
  password: zod.string().min(6),
});

export const signInSchema = zod.object({
  email: zod.string().email(),
  password: zod.string(),
});

export const roleSchema = zod.object({
  name: zod.string().min(2),
});

export const communitySchema = zod.object({
  name: zod.string().min(2),
});

export const memberSchema = zod.object({
  community: zod.string(),
  user: zod.string(),
  role: zod.string(),
});

export interface JWTPayload {
  id: string;
}
