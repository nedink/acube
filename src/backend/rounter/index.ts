import * as trpc from "@trpc/server";
import { z } from "zod";
import { prisma } from '../utils/prisma'


const SCRYFALL_API = 'https://api.scryfall.com'


export const appRouter = trpc.router()
.query('find-all', {
    async resolve() {
        return await prisma.cubeEntry.findMany()
    }
})
.mutation('add-entry', {
    input: z.object({
        cardName: z.string()
    }),
    async resolve({input}) {
        const entry = await prisma.cubeEntry.create({
            data: {...input}
        })
        return { success: true, entry: entry }
    }
})


// export type definition of API
export type AppRouter = typeof appRouter;
