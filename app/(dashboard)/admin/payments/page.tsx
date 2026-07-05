"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Shield, CheckCircle, XCircle, Clock, User, Mail, Users } from "lucide-react"
import { trpc } from "@/lib/trpc/client"
import { formatDate } from "@/lib/utils"

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "all">("pending")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const utils = trpc.useUtils()

  const { data: pendingUsers, isLoading: pendingLoading } = trpc.admin.getPendingPayments.useQuery()
  const { data: allUsers, isLoading: allLoading } = trpc.admin.getAllMembers.useQuery()

  const confirmPayment = trpc.admin.confirmPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment confirmed")
      utils.admin.getPendingPayments.invalidate()
      utils.admin.getAllMembers.invalidate()
    },
    onError: (err) => {
      toast.error("Failed to confirm", { description: err.message })
    },
  })

  const rejectPayment = trpc.admin.rejectPayment.useMutation({
    onSuccess: () => {
      toast.success("Payment rejected")
      utils.admin.getPendingPayments.invalidate()
      utils.admin.getAllMembers.invalidate()
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

  const isLoading = activeTab === "pending" ? pendingLoading : allLoading
  const users = activeTab === "pending" ? pendingUsers : allUsers

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
            <p className="text-xs text-violet-100">Review and manage user subscription payments</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "pending" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("pending")}
        >
          <Clock className="h-4 w-4 mr-1" />
          Pending ({pendingUsers?.length || 0})
        </Button>
        <Button
          variant={activeTab === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("all")}
        >
          <Users className="h-4 w-4 mr-1" />
          All Members
        </Button>
      </div>

      {/* Content */}
      <Card className="shadow-card overflow-hidden border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            {activeTab === "pending" ? (
              <>
                <Clock className="h-4 w-4 text-amber-500" />
                Pending Verifications
              </>
            ) : (
              <>
                <Users className="h-4 w-4 text-violet-500" />
                All Members
              </>
            )}
          </CardTitle>
          <CardDescription>
            {activeTab === "pending"
              ? "Users who have submitted payment confirmation and are awaiting review."
              : "All users and their subscription status."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
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
          ) : !users || users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {activeTab === "pending" ? (
                <>
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No pending payments to review.</p>
                </>
              ) : (
                <>
                  <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No members yet.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((member: any) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    member.payment_pending
                      ? "border-amber-200 bg-amber-50/50"
                      : member.plan === "pro"
                      ? "border-green-200 bg-green-50/50"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      member.payment_pending
                        ? "bg-amber-100"
                        : member.plan === "pro"
                        ? "bg-green-100"
                        : "bg-slate-100"
                    }`}>
                      <User className={`h-5 w-5 ${
                        member.payment_pending
                          ? "text-amber-600"
                          : member.plan === "pro"
                          ? "text-green-600"
                          : "text-slate-500"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.full_name || "Unknown"}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </div>
                      {member.payment_order_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Order: {member.payment_order_id}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        member.payment_pending
                          ? "bg-amber-100 text-amber-700"
                          : member.plan === "pro"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }
                    >
                      {member.payment_pending ? "Pending" : member.plan === "pro" ? "Active" : "Free"}
                    </Badge>
                    {member.payment_pending && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleConfirm(member.id)}
                          disabled={processingId === member.id}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleReject(member.id)}
                          disabled={processingId === member.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
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
