"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

const pageNames: Record<string, string> = {
  "/": "Dashboard",
  "/deals": "Deals",
  "/brands": "Brands",
  "/invoices": "Invoices",
  "/payments": "Payments",
  "/rates": "Rates",
  "/contracts": "Contracts",
  "/notifications": "Notifications",
  "/settings": "Settings",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <header className="flex h-16 items-center border-b px-4 gap-4">
          <SidebarTrigger />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {pathname !== "/" && (
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {pageNames[pathname] || pathname.split("/").pop()}
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
