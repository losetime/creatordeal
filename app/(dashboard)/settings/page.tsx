"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  User, CreditCard, Bell, Shield, Mail, Settings, Check,
  Globe, Clock, DollarSign, Download, Smartphone, Key
} from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "@/lib/auth/context"
import { formatCurrency, formatDate } from "@/lib/utils"

type NavSection = "profile" | "billing" | "notifications" | "security"

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ja", label: "日本語" },
]

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "CNY", label: "CNY - Chinese Yuan" },
]

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function BillingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-lg" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const [activeNav, setActiveNav] = useState<NavSection>("profile")
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState("")

  const [notifications, setNotifications] = useState({
    emailDeadline7: true,
    emailDeadline3: true,
    emailDeadline1: true,
    emailDeadlineToday: true,
    emailPayment7: true,
    emailPaymentToday: true,
    emailPaymentOverdue: true,
    emailDealUpdate: true,
    pushEnabled: true,
    pushDeadline: true,
    pushPayment: true,
    pushDealUpdate: false,
  })

  const [remindDays, setRemindDays] = useState({
    deadline7: true,
    deadline3: true,
    deadline1: true,
    deadlineToday: true,
  })

  const utils = trpc.useUtils()

  const [timezone, setTimezone] = useState("America/New_York")
  const [language, setLanguage] = useState("en")
  const [currency, setCurrency] = useState("USD")

  const { data: profile, isLoading: profileLoading } = trpc.profiles.get.useQuery()
  const { data: invoices, isLoading: invoicesLoading } = trpc.invoices.list.useQuery()

  const updateProfile = trpc.profiles.update.useMutation({
    onSuccess: () => {
      utils.profiles.get.invalidate()
      toast.success("Profile saved", { description: "Your changes have been saved." })
      setIsEditingName(false)
    },
    onError: (error) => {
      toast.error("Failed to save profile", { description: error.message })
    },
  })

  useEffect(() => {
    if (profile) {
      if (profile.timezone) setTimezone(profile.timezone)
      if (profile.language) setLanguage(profile.language)
      if (profile.currency) setCurrency(profile.currency)
    }
  }, [profile])

  const handleSaveSettings = () => {
    updateProfile.mutate({ timezone, language, currency })
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  const toggleRemindDays = (key: keyof typeof remindDays) => {
    setRemindDays({ ...remindDays, [key]: !remindDays[key] })
  }

  const handleSaveProfile = () => {
    if (!editedName.trim()) {
      toast.error("Name is required")
      return
    }
    updateProfile.mutate({ full_name: editedName.trim() })
  }

  const handleSavePreferences = () => {
    toast.success("Preferences saved", { description: "Notification settings updated." })
  }

  const handleUpgrade = () => {
    toast.info("Redirecting to checkout...", { description: "Stripe integration will process your payment." })
  }

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast.error("No email found")
      return
    }
    const { createClient } = await import("@/lib/supabase/client")
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success("Reset link sent", { description: "Check your email for a password reset link." })
    }
  }

  const handleEnable2FA = () => {
    toast.info("Coming soon", { description: "Two-factor authentication requires Supabase MFA integration." })
  }

  const navItems = [
    { icon: User, label: "Profile", id: "profile" as NavSection },
    { icon: CreditCard, label: "Billing", id: "billing" as NavSection },
    { icon: Bell, label: "Notifications", id: "notifications" as NavSection },
    { icon: Shield, label: "Security", id: "security" as NavSection },
  ]

  const userInitials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U"

  const planLabel = profile?.plan === "pro" ? "Pro" : profile?.plan === "team" ? "Team" : "Free"

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 p-5 text-white shadow-elevated">
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-1.5">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Settings</h2>
            <p className="text-xs text-teal-100">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings Navigation */}
        <Card className="shadow-card overflow-hidden border-0">
          <CardContent className="p-2">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    activeNav === item.id
                      ? "bg-teal-600 text-white shadow-md"
                      : "text-muted-foreground hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          {activeNav === "profile" && (
            <Card className="shadow-card overflow-hidden border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-teal-600" />
                  Profile
                </CardTitle>
                <CardDescription>
                  Manage your account settings and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileLoading ? (
                  <ProfileSkeleton />
                ) : (
                  <>
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 shadow-lg">
                          {profile?.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name ?? "Avatar"}
                              className="h-20 w-20 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-bold text-white">{userInitials}</span>
                          )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <span className="text-xs text-white font-medium">Upload</span>
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const { createClient } = await import("@/lib/supabase/client")
                            const supabase = createClient()
                            const fileName = `avatars/${user?.id}/${Date.now()}-${file.name}`
                            const { error } = await supabase.storage.from("avatars").upload(fileName, file, {
                              contentType: file.type,
                              upsert: true,
                            })
                            if (error) {
                              toast.error("Upload failed", { description: error.message })
                              return
                            }
                            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName)
                            updateProfile.mutate({ avatar_url: urlData.publicUrl })
                            toast.success("Avatar updated")
                          }} />
                        </label>
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{profile?.full_name || "User"}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Badge variant="secondary" className="mt-1 bg-teal-100 text-teal-700 text-xs">{planLabel} Plan</Badge>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-sm font-medium">Full Name</Label>
                        {isEditingName ? (
                          <div className="flex gap-2">
                            <Input
                              id="full_name"
                              placeholder="Your name"
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="bg-slate-50 focus:bg-white"
                            />
                            <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                              {updateProfile.isPending ? "Saving..." : "Save"}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="flex h-9 w-full items-center rounded-md border border-input bg-slate-50 px-3 py-1 text-sm cursor-pointer hover:bg-slate-100 transition-colors"
                            onClick={() => {
                              setEditedName(profile?.full_name ?? "")
                              setIsEditingName(true)
                            }}
                          >
                            {profile?.full_name || "Click to set name"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email ?? ""}
                          disabled
                          className="bg-slate-50 opacity-60 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Timezone
                        </Label>
                        <select
                          id="timezone"
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-slate-50 px-3 py-1 text-sm shadow-sm transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {timezones.map((tz) => (
                            <option key={tz.value} value={tz.value}>{tz.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="language" className="text-sm font-medium flex items-center gap-1">
                          <Globe className="h-3 w-3" /> Language
                        </Label>
                        <select
                          id="language"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-slate-50 px-3 py-1 text-sm shadow-sm transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> Currency
                        </Label>
                        <select
                          id="currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="flex h-9 w-full rounded-md border border-input bg-slate-50 px-3 py-1 text-sm shadow-sm transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {currencies.map((curr) => (
                            <option key={curr.value} value={curr.value}>{curr.label}</option>
                          ))}
                        </select>
                      </div>
                      {profile?.created_at && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Member Since</Label>
                          <div className="flex h-9 w-full items-center rounded-md border border-input bg-slate-50 px-3 py-1 text-sm text-muted-foreground">
                            {formatDate(profile.created_at)}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSaveSettings} disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Billing */}
          {activeNav === "billing" && (
            <>
              <Card className="shadow-card overflow-hidden border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-4 w-4 text-violet-500" />
                    Subscription
                  </CardTitle>
                  <CardDescription>
                    You&apos;re currently on the{" "}
                    <Badge variant="secondary" className="bg-teal-100 text-teal-700">{planLabel}</Badge>{" "}
                    plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{planLabel} Plan</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile?.plan === "pro" || profile?.plan === "team"
                            ? "Unlimited active deals, AI contract scanning, rate benchmarking, priority support"
                            : "3 active deals, basic features"}
                        </p>
                      </div>
                      {profile?.plan !== "pro" && (
                        <Button onClick={handleUpgrade}>Upgrade to Pro - $19/mo</Button>
                      )}
                    </div>
                  </div>
                  {profile?.plan !== "pro" && (
                    <div className="rounded-lg p-4 bg-teal-50">
                      <p className="font-medium text-sm text-slate-700 mb-3">Pro includes:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Unlimited active deals",
                          "AI contract scanning",
                          "Rate benchmarking",
                          "Priority support"
                        ].map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <div className="h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center">
                              <Check className="h-3 w-3 text-teal-600" />
                            </div>
                            <span className="text-slate-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card className="shadow-card overflow-hidden border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    Billing History
                  </CardTitle>
                  <CardDescription>
                    View and download your past invoices
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {invoicesLoading ? (
                    <BillingSkeleton />
                  ) : (invoices ?? []).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      No invoices yet. They&apos;ll appear here once you&apos;re billed.
                    </div>
                  ) : (
                    <div className="divide-y">
                      {(invoices ?? []).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {invoice.deals?.brands?.name ? `${invoice.deals.brands.name} - ` : ""}
                                {invoice.deals?.title ?? "Invoice"}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatDate(invoice.due_date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                invoice.status === "paid"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : invoice.status === "overdue"
                                  ? "bg-rose-100 text-rose-700"
                                  : invoice.status === "sent"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {invoice.status}
                            </Badge>
                            <span className="text-sm font-medium">{formatCurrency(invoice.amount)}</span>
                            <Button variant="ghost" size="sm" onClick={() => toast.success("Invoice downloaded", { description: `${invoice.invoice_number}.pdf` })}>
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Notification Preferences */}
          {activeNav === "notifications" && (
            <Card className="shadow-card overflow-hidden border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-amber-500" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div className="rounded-lg p-4 bg-slate-50">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-blue-100 p-1">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    Email Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Content Deadline Reminders</p>
                        <p className="text-xs text-muted-foreground">Get notified before content is due</p>
                      </div>
                      <div className="flex gap-2">
                        {[
                          { key: "emailDeadline7", label: "7d" },
                          { key: "emailDeadline3", label: "3d" },
                          { key: "emailDeadline1", label: "1d" },
                          { key: "emailDeadlineToday", label: "Today" },
                        ].map((item) => (
                          <label
                            key={item.key}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full cursor-pointer transition-all ${
                              notifications[item.key as keyof typeof notifications]
                                ? "bg-teal-100 text-teal-700 border border-teal-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications]}
                              onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                              className="sr-only"
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
                      <div className="flex gap-2">
                        {[
                          { key: "emailPayment7", label: "7d" },
                          { key: "emailPaymentToday", label: "Due" },
                          { key: "emailPaymentOverdue", label: "Overdue" },
                        ].map((item) => (
                          <label
                            key={item.key}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full cursor-pointer transition-all ${
                              notifications[item.key as keyof typeof notifications]
                                ? "bg-teal-100 text-teal-700 border border-teal-200"
                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={notifications[item.key as keyof typeof notifications]}
                              onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                              className="sr-only"
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
                      <label
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full cursor-pointer transition-all ${
                          notifications.emailDealUpdate
                            ? "bg-teal-100 text-teal-700 border border-teal-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={notifications.emailDealUpdate}
                          onChange={() => toggleNotification("emailDealUpdate")}
                          className="sr-only"
                        />
                        Enable
                      </label>
                    </div>
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="rounded-lg p-4 bg-slate-50">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <div className="rounded-lg bg-violet-100 p-1">
                      <Smartphone className="h-4 w-4 text-violet-600" />
                    </div>
                    Push Notifications
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Enable Push Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive notifications in your browser</p>
                      </div>
                      <label
                        className={`relative inline-flex items-center cursor-pointer ${
                          notifications.pushEnabled ? "opacity-100" : "opacity-60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={notifications.pushEnabled}
                          onChange={() => toggleNotification("pushEnabled")}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                      </label>
                    </div>

                    <div className={`space-y-3 ${!notifications.pushEnabled ? "opacity-50 pointer-events-none" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Deadline Alerts</p>
                          <p className="text-xs text-muted-foreground">Get instant deadline reminders</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.pushDeadline}
                            onChange={() => toggleNotification("pushDeadline")}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Payment Alerts</p>
                          <p className="text-xs text-muted-foreground">Get instant payment reminders</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.pushPayment}
                            onChange={() => toggleNotification("pushPayment")}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Deal Updates</p>
                          <p className="text-xs text-muted-foreground">Get instant deal notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notifications.pushDealUpdate}
                            onChange={() => toggleNotification("pushDealUpdate")}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deadline Reminder Days */}
                <div className="rounded-lg p-4 bg-slate-50">
                  <h4 className="font-semibold mb-2 text-sm">Default Reminder Days</h4>
                  <p className="text-xs text-muted-foreground mb-4">
                    Choose which days before a deadline to send reminders
                  </p>
                  <div className="flex gap-2">
                    {[
                      { key: "deadline7", label: "7 days" },
                      { key: "deadline3", label: "3 days" },
                      { key: "deadline1", label: "1 day" },
                      { key: "deadlineToday", label: "On due" },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          remindDays[item.key as keyof typeof remindDays]
                            ? "bg-teal-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={remindDays[item.key as keyof typeof remindDays]}
                          onChange={() => toggleRemindDays(item.key as keyof typeof remindDays)}
                          className="sr-only"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSavePreferences}>Save Preferences</Button>
              </CardContent>
            </Card>
          )}

          {/* Security */}
          {activeNav === "security" && (
            <>
              {/* Password */}
              <Card className="shadow-card overflow-hidden border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Key className="h-4 w-4 text-rose-500" />
                    Password
                  </CardTitle>
                  <CardDescription>
                    Change your account password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Manage your account password
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleChangePassword}>Change Password</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Two-Factor Authentication */}
              <Card className="shadow-card overflow-hidden border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Smartphone className="h-4 w-4 text-violet-500" />
                    Two-Factor Authentication
                  </CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Protect your account with 2FA
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleEnable2FA}>Enable 2FA</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
