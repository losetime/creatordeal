"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Building2, Globe, Mail, User } from "lucide-react"

const mockBrands = [
  {
    id: "1",
    name: "Nike",
    website: "https://nike.com",
    contact_name: "John Smith",
    contact_email: "john@nike.com",
    deal_count: 3,
    total_revenue: 15000,
  },
  {
    id: "2",
    name: "Apple",
    website: "https://apple.com",
    contact_name: "Sarah Johnson",
    contact_email: "sarah@apple.com",
    deal_count: 2,
    total_revenue: 16000,
  },
  {
    id: "3",
    name: "Samsung",
    website: "https://samsung.com",
    contact_name: "Mike Lee",
    contact_email: "mike@samsung.com",
    deal_count: 1,
    total_revenue: 12000,
  },
  {
    id: "4",
    name: "Tesla",
    website: "https://tesla.com",
    contact_name: "Emily Chen",
    contact_email: "emily@tesla.com",
    deal_count: 1,
    total_revenue: 15000,
  },
]

export default function BrandsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Brands</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>
                Add a brand you're working with to your contacts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name</Label>
                <Input id="name" placeholder="Nike" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://nike.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input id="contact_name" placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input id="contact_email" placeholder="john@nike.com" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Add Brand
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Brands Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockBrands.map((brand) => (
          <Card key={brand.id} className="cursor-pointer transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{brand.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {brand.deal_count} deals
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Globe className="mr-2 h-4 w-4" />
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {brand.website.replace("https://", "")}
                </a>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                {brand.contact_name}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {brand.contact_email}
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium">
                  Total Revenue: ${brand.total_revenue.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
