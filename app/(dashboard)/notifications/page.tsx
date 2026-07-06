"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc/client"
import { formatDate } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Bell, Clock, DollarSign, Handshake, Info, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const iconMap: Record<string, React.ElementType> = {
  deadline: Clock,
  payment: DollarSign,
  deal_update: Handshake,
  system: Info,
}

type FilterType = "all" | "unread" | "deadline" | "payment" | "deal_update" | "system"

export default function NotificationsPage() {
  const { t } = useLocale()
  const [filter, setFilter] = useState<FilterType>("all")
  const utils = trpc.useUtils()

  const { data: notifications = [], isLoading } = trpc.notifications.list.useQuery()

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate()
      toast.success("Marked as read")
    },
    onError: (error) => {
      toast.error("Failed to mark as read", { description: error.message })
    },
  })

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate()
      toast.success("All notifications marked as read")
    },
    onError: (error) => {
      toast.error("Failed to mark all as read", { description: error.message })
    },
  })

  const dismissMutation = trpc.notifications.dismiss.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate()
      toast.success("Notification dismissed")
    },
    onError: (error) => {
      toast.error("Failed to dismiss notification", { description: error.message })
    },
  })

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    return n.type === filter
  })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-elevated">
          <div className="absolute inset-0 dot-pattern opacity-15" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white/15 p-1.5">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notifications</h2>
                <Skeleton className="h-3 w-16 mt-1 bg-white/20" />
              </div>
            </div>
            <Skeleton className="h-8 w-32 bg-white/15" />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-7 w-16" />
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-4 border-b border-border last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden p-5 text-white shadow-elevated" style={{ backgroundColor: "#0d9488" }}>
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-white/15 p-1.5">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("notifications.title")}</h2>
              <p className="text-xs text-teal-100">{unreadCount} unread</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
            className="bg-white/15 hover:bg-white/25 text-white border-0 h-8"
            size="sm"
          >
            <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Mark All Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "unread", "deadline", "payment", "deal_update", "system"] as FilterType[]).map(
          (f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              className="h-7 text-xs"
            >
              {f === "all" && "All"}
              {f === "unread" && `Unread (${unreadCount})`}
              {f === "deadline" && "Deadlines"}
              {f === "payment" && "Payments"}
              {f === "deal_update" && "Deals"}
              {f === "system" && "System"}
            </Button>
          )
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm">No notifications to show</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = iconMap[notification.type] || Bell
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        notification.type === "deadline"
                          ? "bg-orange-100 text-orange-600"
                          : notification.type === "payment"
                          ? "bg-green-100 text-green-600"
                          : notification.type === "deal_update"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-medium ${
                            !notification.read
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            markAsReadMutation.mutate({ id: notification.id })
                          }
                          disabled={markAsReadMutation.isPending}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          dismissMutation.mutate({ id: notification.id })
                        }
                        disabled={dismissMutation.isPending}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
