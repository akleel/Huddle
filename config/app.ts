import { publicEnv } from "@/shared/env/env";

export const appConfig = {
  name: publicEnv.NEXT_PUBLIC_APP_NAME,
} as const;
