import { router } from "./server"
import { dealsRouter } from "./routers/deals"
import { brandsRouter } from "./routers/brands"
import { invoicesRouter } from "./routers/invoices"
import { notificationsRouter } from "./routers/notifications"
import { profilesRouter } from "./routers/profiles"
import { contractsRouter } from "./routers/contracts"
import { ratesRouter } from "./routers/rates"
import { paymentsRouter } from "./routers/payments"
import { deliverablesRouter } from "./routers/deliverables"
import { adminRouter } from "./routers/admin"

export const appRouter = router({
  deals: dealsRouter,
  brands: brandsRouter,
  invoices: invoicesRouter,
  notifications: notificationsRouter,
  profiles: profilesRouter,
  contracts: contractsRouter,
  rates: ratesRouter,
  payments: paymentsRouter,
  deliverables: deliverablesRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
