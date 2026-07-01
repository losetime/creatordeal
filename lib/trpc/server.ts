import { initTRPC, TRPCError } from "@trpc/server"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const t = initTRPC.context<typeof createTRPCContext>().create()

export const createTRPCContext = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  return {
    supabase,
    user,
  }
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(enforceAuth)
