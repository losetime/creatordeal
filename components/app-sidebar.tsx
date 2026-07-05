"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Zap, Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/lib/auth/context"
import { trpc } from "@/lib/trpc/client"
import { useLocale } from "@/hooks/use-locale"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Handshake,
  Building2,
  FileText,
  Bell,
  Settings,
  Shield,
  DollarSign,
  TrendingUp,
  User,
} from "lucide-react"

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { t, locale, setLocale } = useLocale()

  const { data: unreadCount } = trpc.notifications.getUnreadCount.useQuery()
  const { data: profile } = trpc.profiles.get.useQuery()

  const navigation = [
    { name: t("nav.dashboard"), href: "/home", icon: LayoutDashboard },
    { name: t("nav.deals"), href: "/deals", icon: Handshake },
    { name: t("nav.brands"), href: "/brands", icon: Building2 },
    { name: t("nav.invoices"), href: "/invoices", icon: FileText },
    { name: t("nav.payments"), href: "/payments", icon: DollarSign },
    { name: t("nav.rates"), href: "/rates", icon: TrendingUp },
    { name: t("nav.contracts"), href: "/contracts", icon: Shield },
  ]

  const secondaryNav = [
    { name: t("nav.notifications"), href: "/notifications", icon: Bell },
    { name: t("nav.settings"), href: "/settings", icon: Settings },
  ]

  const adminNav = [
    { name: t("nav.admin"), href: "/admin/payments", icon: Shield },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href))

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || "U"

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/home" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
                  CreatorDeal
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[...secondaryNav, ...(profile?.role === "admin" ? adminNav : [])].map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild isActive={isActive(item.href)}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                      {item.name === "Notifications" && unreadCount != null && unreadCount > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="gradient-primary text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-semibold">
                      {profile?.full_name || user?.email || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || ""}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.settings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale(locale === "en" ? "zh" : "en")}>
                  {locale === "en" ? "中文" : "English"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
