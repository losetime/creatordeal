"use client"

import { initializePaddle, type Paddle } from "@paddle/paddle-js"

let paddleInstance: Paddle | null = null

export async function getPaddle(): Promise<Paddle | null> {
  if (paddleInstance) return paddleInstance

  if (typeof window === "undefined") return null

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production"

  if (!token) return null

  paddleInstance = (await initializePaddle({
    token,
    environment,
  })) ?? null

  return paddleInstance
}

export const PADDLE_PRICES = {
  pro: process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || "",
  team: process.env.NEXT_PUBLIC_PADDLE_TEAM_PRICE_ID || "",
}
