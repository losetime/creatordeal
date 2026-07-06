import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatRelativeTime(date: Date | string) {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  return `In ${days} days`
}

/**
 * Generate a safe storage path for Supabase Storage
 * Uses timestamp + extension to avoid filename issues (Chinese chars, spaces, etc.)
 */
export function generateStoragePath(
  userId: string,
  folder: string,
  fileName: string,
  prefix?: string
): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "bin"
  const timestamp = Date.now()
  const subPath = prefix ? `${prefix}/` : ""
  return `${folder}/${userId}/${subPath}${timestamp}.${ext}`
}
