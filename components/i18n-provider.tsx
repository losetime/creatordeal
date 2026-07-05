"use client"

import { NextIntlClientProvider } from "next-intl"
import { useState, useEffect } from "react"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState("en")
  const [messages, setMessages] = useState<Record<string, string>>({})

  useEffect(() => {
    const savedLang = localStorage.getItem("creatordeal-lang") || "en"
    setLocale(savedLang)
    import(`../messages/${savedLang}.json`).then((mod) => {
      setMessages(mod.default)
    })
  }, [])

  if (Object.keys(messages).length === 0) {
    return <>{children}</>
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
