import * as trpc from "@trpc/server";
import { z } from "zod";


const SCRYFALL_API = 'https://api.scryfall.com'

export const appRouter = trpc.router().query("hello", {
  input: z
    .object({
      text: z.string().nullish(),
    })
    .nullish(),
  resolve({ input }) {
    return {
      greeting: `hello ${input?.text ?? "world"}`,
    };
  },
});
// export type definition of API
export type AppRouter = typeof appRouter;
