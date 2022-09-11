import * as trpc from "@trpc/server";
import { z } from "zod";


const SCRYFALL_API = 'https://api.scryfall.com'

export const appRouter = trpc.router()
// .query("get-cube", prisma.);



// export type definition of API
export type AppRouter = typeof appRouter;
