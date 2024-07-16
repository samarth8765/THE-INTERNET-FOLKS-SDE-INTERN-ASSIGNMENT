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

export interface JWTPayload {
  id: string;
}
