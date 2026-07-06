"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { useLocale } from "@/hooks/use-locale"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { t } = useLocale()

  const getPageName = (path: string): string => {
    const map: Record<string, string> = {
      "/home": t("nav.dashboard"),
      "/deals": t("nav.deals"),
      "/brands": t("nav.brands"),
      "/invoices": t("nav.invoices"),
      "/payments": t("nav.payments"),
      "/rates": t("nav.rates"),
      "/contracts": t("nav.contracts"),
      "/notifications": t("nav.notifications"),
      "/settings": t("nav.settings"),
      "/admin/payments": t("nav.admin"),
    }
    return map[path] || "Page"
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center border-b-2 border-foreground px-4 gap-4">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-sm font-medium">{t("nav.dashboard")}</span>
              </BreadcrumbItem>
              {pathname !== "/home" && (
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {getPageName(pathname)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
