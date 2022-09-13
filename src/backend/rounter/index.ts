import * as trpc from "@trpc/server";
import { z } from "zod";
import { prisma } from "../utils/prisma";

const SCRYFALL_API = "https://api.scryfall.com";

export const appRouter = trpc
  .router()
  .query("find-all", {
    async resolve() {
      return await prisma.cubeEntry.findMany();
    },
  })
  .mutation("create-entry", {
    input: z.object({
      cardName: z.string(),
    }),
    async resolve({ input }) {
      const entry = await prisma.cubeEntry.create({
        data: { ...input },
      });
      return { success: true, entry: entry };
    },
  })
  .mutation("delete-entry", {
    input: z.object({
      id: z.string()
    }),
    async resolve({ input }) {
      prisma;
      const entry = await prisma.cubeEntry.delete({
        where: {
          id: input.id
        },
      });
      return { success: true, entry: entry };
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;
