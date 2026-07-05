"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Shield, CheckCircle, XCircle, Clock, User, Mail, ExternalLink } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { formatDate } from "@/lib/utils"

export default function AdminPaymentsPage() {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const utils = trpc.useUtils()

  const { data: pendingUsers, isLoading } = trpc.admin.getPendingPayments.useQuery()

  const confirmPayment = trpc.admin.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment confirmed")
      utils.admin.getPendingPayments.invalidate()
    },
    onError: (err) => {
      toast.error("Failed to confirm", { description: err.message })
    },
  })

  const rejectPayment = trpc.admin.rejectPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment rejected")
      utils.admin.getPendingPayments.invalidate()
    },
    onError: (err) => {
      toast.error("Failed to reject", { description: err.message })
    },
  })

  const handleConfirm = (userId: string) => {
    setProcessingId(userId)
    confirmPayment.mutate({ userId })
    setProcessingId(null)
  }

  const handleReject = (userId: string) => {
    setProcessingId(userId)
    rejectPayment.mutate({ userId })
    setProcessingId(null)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 p-5 text-white shadow-elevated">
        <div className="absolute inset-0 dot-pattern opacity-15" />
        <div className="relative flex items-center gap-2">
          <div className="rounded-lg bg-white/15 p-1.5">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Payment Verification</h2>
            <p className="text-xs text-violet-100">Review and confirm user subscription payments</p>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      <Card className="shadow-card overflow-hidden border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-amber-500" />
            Pending Verifications
          </CardTitle>
          <CardDescription>
            Users who have submitted payment confirmation and are awaiting review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg border animate-pulse">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : !pendingUsers || pendingUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No pending payments to review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <User className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.full_name || "Unknown"}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>Order: {user.payment_order_id}</span>
                        <span>•</span>
                        <span>Submitted: {user.payment_submitted_at ? formatDate(user.payment_submitted_at) : "Unknown"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      Pending
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleConfirm(user.id)}
                      disabled={processingId === user.id}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleReject(user.id)}
                      disabled={processingId === user.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
