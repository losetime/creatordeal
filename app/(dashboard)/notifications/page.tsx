"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Clock, DollarSign, CheckCircle, Filter } from "lucide-react"

const initialNotifications = [
  {
    id: "1",
    type: "deadline",
    title: "Content Deadline Tomorrow",
    message: "Nike Summer Campaign content is due tomorrow",
    read: false,
    created_at: "2026-06-30T10:00:00Z",
  },
  {
    id: "2",
    type: "payment",
    title: "Payment Overdue",
    message: "Samsung Galaxy Launch invoice is 10 days overdue",
    read: false,
    created_at: "2026-06-29T14:30:00Z",
  },
  {
    id: "3",
    type: "deadline",
    title: "Content Deadline in 3 Days",
    message: "Apple Product Review content is due in 3 days",
    read: false,
    created_at: "2026-06-29T09:00:00Z",
  },
  {
    id: "4",
    type: "deal_update",
    title: "Deal Stage Updated",
    message: "Apple Product Review moved to Negotiate stage",
    read: true,
    created_at: "2026-06-28T09:15:00Z",
  },
  {
    id: "5",
    type: "payment",
    title: "Payment Received",
    message: "Netflix Series Promo payment of $4,000 received",
    read: true,
    created_at: "2026-06-27T16:45:00Z",
  },
  {
    id: "6",
    type: "system",
    title: "Welcome to CreatorDeal",
    message: "Get started by adding your first deal",
    read: true,
    created_at: "2026-06-27T08:00:00Z",
  },
]

const iconMap = {
  deadline: Clock,
  payment: DollarSign,
  deal_update: Bell,
  system: CheckCircle,
}

type FilterType = "all" | "unread" | "deadline" | "payment"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filter, setFilter] = useState<FilterType>("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true
    if (filter === "unread") return !n.read
    return n.type === filter
  })

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const dismiss = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
          <CheckCircle className="mr-2 h-4 w-4" /> Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "unread", "deadline", "payment"] as FilterType[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" && "All"}
            {f === "unread" && `Unread (${unreadCount})`}
            {f === "deadline" && "Deadlines"}
            {f === "payment" && "Payments"}
          </Button>
        ))}
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
                const Icon = iconMap[notification.type as keyof typeof iconMap]
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
                            !notification.read ? "text-foreground" : "text-muted-foreground"
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
                        {new Date(notification.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark Read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismiss(notification.id)}
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
