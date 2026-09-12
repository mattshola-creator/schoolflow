import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePublicEnvironment } from "@/lib/env";
import type { Database } from "@/types/database.generated";
export async function createClient() {
  const env = requirePublicEnvironment();
  const store = await cookies();
  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Server Components cannot write cookies; M1 proxy refreshes sessions. */
          }
        },
      },
    },
  );
}
