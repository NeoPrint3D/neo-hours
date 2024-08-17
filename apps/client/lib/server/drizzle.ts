import { createDrizzleD1 } from "@neo-hours/db";

export const useDrizzle = () => createDrizzleD1(hubDatabase());
