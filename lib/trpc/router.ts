import { router } from "./server"
import { dealsRouter } from "./routers/deals"
import { brandsRouter } from "./routers/brands"
import { invoicesRouter } from "./routers/invoices"

export const appRouter = router({
  deals: dealsRouter,
  brands: brandsRouter,
  invoices: invoicesRouter,
})

export type AppRouter = typeof appRouter
