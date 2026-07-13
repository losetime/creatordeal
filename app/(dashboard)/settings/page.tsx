"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import {
  User, Bell, Shield, Mail, Settings, Check,
  Globe, Clock, DollarSign, Download, Key, CheckCircle
} from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { useAuth } from "@/lib/auth/context"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useLocale } from "@/hooks/use-locale"

const KOFI_PRO_LINK = "https://ko-fi.com/summary/502183d7-97b2-4f16-a024-393a2d5087a6"

type NavSection = "profile" | "notifications" | "security"

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

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { t, locale, setLocale } = useLocale()
  const [activeNav, setActiveNav] = useState<NavSection>("profile")
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState("")

  const [notifications, setNotifications] = useState({
    emailDeadline3: true,
    emailDeadlineToday: true,
    emailPaymentOverdue: false,
  })

  const utils = trpc.useUtils()

  const [timezone, setTimezone] = useState("America/New_York")
  const [language, setLanguage] = useState("en")
  const [currency, setCurrency] = useState("USD")

  const { data: profile, isLoading: profileLoading } = trpc.profiles.get.useQuery()
  const { data: notifPrefs } = trpc.notificationPreferences.get.useQuery()

  // Load notification preferences from database
  useEffect(() => {
    if (notifPrefs) {
      setNotifications({
        emailDeadline3: notifPrefs.email_deadline_3d ?? true,
        emailDeadlineToday: notifPrefs.email_deadline_today ?? true,
        emailPaymentOverdue: notifPrefs.email_payment_overdue ?? false,
      })
    }
  }, [notifPrefs])

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

  const updateNotifPrefs = trpc.notificationPreferences.update.useMutation({
    onSuccess: () => {
      utils.notificationPreferences.get.invalidate()
      toast.success("Preferences saved", { description: "Notification settings updated." })
    },
    onError: (error) => {
      toast.error("Failed to save preferences", { description: error.message })
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
    setLocale(language as "en" | "zh")
    updateProfile.mutate({ timezone, language, currency })
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  const handleSaveProfile = () => {
    if (!editedName.trim()) {
      toast.error("Name is required")
      return
    }
    updateProfile.mutate({ full_name: editedName.trim() })
  }

  const handleSavePreferences = () => {
    updateNotifPrefs.mutate({
      email_deadline_3d: notifications.emailDeadline3,
      email_deadline_today: notifications.emailDeadlineToday,
      email_payment_overdue: notifications.emailPaymentOverdue,
    })
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

  const navItems = [
    { icon: User, label: "Profile", id: "profile" as NavSection },
    { icon: Bell, label: "Notifications", id: "notifications" as NavSection },
    { icon: Shield, label: "Security", id: "security" as NavSection },
  ]

  const userInitials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U"

  const planLabel = profile?.plan === "pro" ? "Creator Club" : profile?.plan === "team" ? "Team" : "Free"

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden p-5 text-white shadow-elevated" style={{ backgroundColor: "#0d9488" }}>
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
                  {t("settings.profile")}
                </CardTitle>
                <CardDescription>
                  {t("settings.profileDesc")}
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
                            const { generateStoragePath } = await import("@/lib/utils")
                            const supabase = createClient()
                            const fileName = generateStoragePath(user?.id || "", "avatars", file.name)
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
                      </div>
                      <div>
                        <p className="font-medium">{profile?.full_name || "User"}</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                        <Badge variant="secondary" className="mt-1 bg-teal-100 text-teal-700 text-xs">{planLabel}</Badge>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-sm font-medium mb-2 block">{t("settings.fullName")}</Label>
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
                        <Label htmlFor="email" className="text-sm font-medium mb-2 block">{t("settings.email")}</Label>
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
                          <Clock className="h-3 w-3" /> {t("settings.timezone")}
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
                          <Globe className="h-3 w-3" /> {t("settings.language")}
                        </Label>
                        <select
                          id="language"
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value)
                            setLocale(e.target.value as "en" | "zh")
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-slate-50 px-3 py-1 text-sm shadow-sm transition-colors focus:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {languages.map((lang) => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="currency" className="text-sm font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" /> {t("settings.currency")}
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
                          <Label className="text-sm font-medium mb-2 block">{t("settings.memberSince")}</Label>
                          <div className="flex h-9 w-full items-center rounded-md border border-input bg-slate-50 px-3 py-1 text-sm text-muted-foreground">
                            {formatDate(profile.created_at)}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button onClick={handleSaveSettings} disabled={updateProfile.isPending}>
                      {updateProfile.isPending ? `${t("common.loading")}` : t("settings.saveSettings")}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Notification Preferences */}
          {activeNav === "notifications" && (
            <Card className="shadow-card overflow-hidden border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="h-4 w-4 text-amber-500" />
                  {t("settings.notificationPrefs")}
                </CardTitle>
                <CardDescription>
                  {t("settings.notificationPrefsDesc")}
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
                  <div className="space-y-0">
                    <div className="flex items-center justify-between py-4 border-b border-slate-200">
                      <div>
                        <p className="text-sm font-medium">Content Deadline Reminders</p>
                        <p className="text-xs text-muted-foreground">Remind you 3 days and on the day content is due</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailDeadline3 || notifications.emailDeadlineToday}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setNotifications({
                              ...notifications,
                              emailDeadline3: checked,
                              emailDeadlineToday: checked,
                            })
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-sm font-medium">Payment Reminders</p>
                        <p className="text-xs text-muted-foreground">Remind brand 1 day after payment is due (skips if already paid)</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailPaymentOverdue}
                          onChange={() => toggleNotification("emailPaymentOverdue")}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
                      </label>
                    </div>
                    {notifications.emailPaymentOverdue && (
                      <p className="text-xs text-red-600 pb-4">
                        Please remember to confirm payment on the platform after receiving it, to avoid unnecessary misunderstandings with your brand partners.
                      </p>
                    )}
                  </div>
                </div>

                <Button onClick={handleSavePreferences}>{t("settings.savePreferences")}</Button>
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
                    {t("settings.password")}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.passwordDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div>
                      <p className="font-medium">{t("settings.password")}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("settings.passwordDesc")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleChangePassword}>{t("settings.changePassword")}</Button>
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
