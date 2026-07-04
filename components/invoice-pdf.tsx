"use client"

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0d9488",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0d9488",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 10,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 4,
  },
  parties: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  partyBlock: {
    width: "45%",
  },
  partyLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  partyDetail: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  metaItem: {
    width: "30%",
  },
  metaLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeaderText: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableCell: {
    fontSize: 10,
  },
  colDesc: { width: "55%" },
  colQty: { width: "15%", textAlign: "center" },
  colRate: { width: "15%", textAlign: "right" },
  colAmount: { width: "15%", textAlign: "right" },
  totals: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 30,
  },
  totalsBlock: {
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 10,
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: "#0d9488",
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0d9488",
  },
  paymentInfo: {
    backgroundColor: "#f0fdfa",
    padding: 15,
    borderRadius: 4,
    marginBottom: 30,
  },
  paymentTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0d9488",
    marginBottom: 6,
  },
  paymentDetail: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.6,
  },
  notes: {
    marginBottom: 30,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
  },
})

interface InvoicePDFProps {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  amount: number
  currency: string
  taxRate?: number
  taxAmount?: number
  notes?: string | null
  paymentTerms?: string | null
  issuer: {
    name: string
    email: string
    address?: string | null
    taxId?: string | null
  }
  recipient: {
    name: string
    email?: string | null
    address?: string | null
    taxId?: string | null
  }
  items: Array<{
    description: string
    quantity: number
    rate: number
    amount: number
  }>
}

export function InvoicePDF({
  invoiceNumber,
  invoiceDate,
  dueDate,
  amount,
  currency,
  taxRate = 0,
  taxAmount = 0,
  notes,
  paymentTerms,
  issuer,
  recipient,
  items,
}: InvoicePDFProps) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const total = subtotal + taxAmount

  const formatAmount = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(val)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>CreatorDeal</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.parties}>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{issuer.name}</Text>
            <Text style={styles.partyDetail}>{issuer.email}</Text>
            {issuer.address && (
              <Text style={styles.partyDetail}>{issuer.address}</Text>
            )}
            {issuer.taxId && (
              <Text style={styles.partyDetail}>Tax ID: {issuer.taxId}</Text>
            )}
          </View>
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Bill To</Text>
            <Text style={styles.partyName}>{recipient.name}</Text>
            {recipient.email && (
              <Text style={styles.partyDetail}>{recipient.email}</Text>
            )}
            {recipient.address && (
              <Text style={styles.partyDetail}>{recipient.address}</Text>
            )}
            {recipient.taxId && (
              <Text style={styles.partyDetail}>Tax ID: {recipient.taxId}</Text>
            )}
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Invoice Date</Text>
            <Text style={styles.metaValue}>{invoiceDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{dueDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Payment Terms</Text>
            <Text style={styles.metaValue}>{paymentTerms || "Net 30"}</Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDesc]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colRate]}>Rate</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {items.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.colRate]}>{formatAmount(item.rate)}</Text>
              <Text style={[styles.tableCell, styles.colAmount]}>{formatAmount(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalsBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatAmount(subtotal)}</Text>
            </View>
            {taxAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({taxRate}%)</Text>
                <Text style={styles.totalValue}>{formatAmount(taxAmount)}</Text>
              </View>
            )}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>{formatAmount(total)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        {paymentTerms && (
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Payment Terms</Text>
            <Text style={styles.paymentDetail}>{paymentTerms}</Text>
          </View>
        )}

        {/* Notes */}
        {notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by CreatorDeal — Sponsorship Management for Creators
        </Text>
      </Page>
    </Document>
  )
}
