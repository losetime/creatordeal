"use client"

import { useState, useEffect, useCallback } from "react"

type Locale = "en" | "zh"

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("en")
  const [messages, setMessages] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = (localStorage.getItem("creatordeal-lang") as Locale) || "en"
    setLocaleState(saved)
    loadMessages(saved)
  }, [])

  const loadMessages = async (loc: Locale) => {
    try {
      const mod = await import(`../messages/${loc}.json`)
      setMessages(mod.default)
    } catch {
      const mod = await import("../messages/en.json")
      setMessages(mod.default)
    }
    setLoading(false)
  }

  const setLocale = useCallback((loc: Locale) => {
    setLocaleState(loc)
    localStorage.setItem("creatordeal-lang", loc)
    loadMessages(loc)
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split(".")
      let value: any = messages
      for (const k of keys) {
        value = value?.[k]
      }
      if (typeof value !== "string") return key
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(`{${k}}`, String(v)),
          value
        )
      }
      return value
    },
    [messages]
  )

  return { locale, setLocale, t, loading }
}
