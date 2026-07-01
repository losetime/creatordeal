"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, CreditCard, Bell, Shield, Mail } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailDeadline7: true,
    emailDeadline3: true,
    emailDeadline1: true,
    emailDeadlineToday: true,
    emailPayment7: true,
    emailPaymentToday: true,
    emailPaymentOverdue: true,
    emailDealUpdate: true,
  })

  const [remindDays, setRemindDays] = useState({
    deadline7: true,
    deadline3: true,
    deadline1: true,
    deadlineToday: true,
  })

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  const toggleRemindDays = (key: keyof typeof remindDays) => {
    setRemindDays({ ...remindDays, [key]: !remindDays[key] })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings Navigation */}
        <Card>
          <CardContent className="p-4">
            <nav className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                <User className="h-4 w-4" />
                Profile
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <CreditCard className="h-4 w-4" />
                Billing
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Bell className="h-4 w-4" />
                Notifications
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                <Shield className="h-4 w-4" />
                Security
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl font-medium">JD</span>
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" placeholder="John Doe" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" defaultValue="john@example.com" />
                </div>
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Content Deadline Reminders</p>
                      <p className="text-xs text-muted-foreground">Get notified before content is due</p>
                    </div>
                    <div className="flex gap-4">
                      {[
                        { key: "emailDeadline7", label: "7 days" },
                        { key: "emailDeadline3", label: "3 days" },
                        { key: "emailDeadline1", label: "1 day" },
                        { key: "emailDeadlineToday", label: "Today" },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                            className="rounded"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Payment Reminders</p>
                      <p className="text-xs text-muted-foreground">Get notified about payments</p>
                    </div>
                    <div className="flex gap-4">
                      {[
                        { key: "emailPayment7", label: "7 days" },
                        { key: "emailPaymentToday", label: "Due day" },
                        { key: "emailPaymentOverdue", label: "Overdue" },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-1 text-sm">
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                            className="rounded"
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Deal Updates</p>
                      <p className="text-xs text-muted-foreground">Get notified when deals change</p>
                    </div>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={notifications.emailDealUpdate}
                        onChange={() => toggleNotification("emailDealUpdate")}
                        className="rounded"
                      />
                      Enable
                    </label>
                  </div>
                </div>
              </div>

              {/* Deadline Reminder Days */}
              <div>
                <h4 className="font-medium mb-3">Default Reminder Days</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose which days before a deadline to send reminders
                </p>
                <div className="flex gap-4">
                  {[
                    { key: "deadline7", label: "7 days before" },
                    { key: "deadline3", label: "3 days before" },
                    { key: "deadline1", label: "1 day before" },
                    { key: "deadlineToday", label: "On due date" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={remindDays[item.key as keyof typeof remindDays]}
                        onChange={() => toggleRemindDays(item.key as keyof typeof remindDays)}
                        className="rounded"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>

              <Button>Save Preferences</Button>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                You're currently on the <strong>Free</strong> plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Free Plan</p>
                    <p className="text-sm text-muted-foreground">
                      3 active deals, basic features
                    </p>
                  </div>
                  <Button>Upgrade to Pro - $19/mo</Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Pro includes:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Unlimited active deals</li>
                  <li>• AI contract scanning</li>
                  <li>• Rate benchmarking</li>
                  <li>• Priority support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
