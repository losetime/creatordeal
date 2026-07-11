// hooks/use-paypal-verification.ts
import { useSyncExternalStore } from "react"
import { paypalVerificationStore } from "@/lib/paypal-verification-store"

/**
 * 订阅 PayPal 验证轮询状态。
 * 组件 remount 不影响轮询本身，状态永远和 store 里的真实情况一致。
 */
export function usePaypalVerification() {
  return useSyncExternalStore(
    paypalVerificationStore.subscribe,
    paypalVerificationStore.getSnapshot,
    paypalVerificationStore.getSnapshot // SSR 场景下的服务端快照
  )
}
