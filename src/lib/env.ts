import { z } from "zod";
const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url().startsWith("https://"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(20),
});
export type PublicEnvironment = z.infer<typeof schema>;
export function getPublicEnvironment() {
  return schema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
export function requirePublicEnvironment(): PublicEnvironment {
  const result = getPublicEnvironment();
  if (!result.success)
    throw new Error("Supabase public environment is not configured correctly.");
  return result.data;
}
