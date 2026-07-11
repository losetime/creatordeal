// lib/paypal-verification-store.ts
//
// 用一个真正独立于 React 生命周期的单例来管理"支付验证轮询"。
// 组件通过 useSyncExternalStore 订阅它，天然解决跨 remount 状态同步问题，
// 不再需要模块级 let 变量 + useEffect 手动同步这种 hack。

type VerificationStatus = "idle" | "verifying" | "success" | "failed"

type VerificationState = {
  status: VerificationStatus
}

type Listener = () => void

const MAX_RETRIES = 10
const POLL_INTERVAL = 2000

class PaypalVerificationStore {
  private state: VerificationState = { status: "idle" }
  private listeners = new Set<Listener>()
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private retryCount = 0

  // --- useSyncExternalStore 接口 ---
  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getSnapshot = (): VerificationState => this.state

  // --- 对外操作 ---

  /**
   * 开始轮询。如果已经在轮询中，直接忽略（天然去重，
   * 不需要额外的 isPollingActive 标志)。
   */
  start(onSuccess: () => void, onGiveUp: () => void) {
    if (this.state.status === "verifying") return

    this.retryCount = 0
    this.setState({ status: "verifying" })
    this.poll(onSuccess, onGiveUp)
  }

  /**
   * 用户主动放弃等待结果（"稍后再查看"）。
   * 真正停止定时器，而不只是隐藏 loading UI。
   */
  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.setState({ status: "idle" })
  }

  private setState(next: VerificationState) {
    this.state = next
    this.listeners.forEach((listener) => listener())
  }

  private async poll(onSuccess: () => void, onGiveUp: () => void) {
    try {
      const res = await fetch("/api/paypal/status")
      const data = await res.json()

      if (data.hasSubscription && data.status === "active" && data.plan === "pro") {
        this.setState({ status: "success" })
        onSuccess()
        return
      }

      this.scheduleRetry(onSuccess, onGiveUp)
    } catch {
      this.scheduleRetry(onSuccess, onGiveUp)
    }
  }

  private scheduleRetry(onSuccess: () => void, onGiveUp: () => void) {
    this.retryCount++
    if (this.retryCount >= MAX_RETRIES) {
      this.setState({ status: "failed" })
      onGiveUp()
      return
    }
    this.timeoutId = setTimeout(() => this.poll(onSuccess, onGiveUp), POLL_INTERVAL)
  }
}

// 单例：整个 App 共享同一个轮询状态源
export const paypalVerificationStore = new PaypalVerificationStore()
