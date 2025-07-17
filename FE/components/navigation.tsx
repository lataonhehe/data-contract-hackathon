"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Home, Plus, MessageSquare, Database, Shield, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { api } from "@/lib/api"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/create", label: "Create", icon: Plus },
  { href: "/query", label: "Query Assistant", icon: MessageSquare },
  { href: "/simulate", label: "Simulate Data", icon: Database },
  { href: "/monitoring", label: "Monitoring", icon: Shield },
]

export function Navigation() {
  const pathname = usePathname()
  const isApiConfigured = api.utils.isApiConfigured()

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href}>
            <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start">
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex w-64 bg-card border-r min-h-screen p-4">
        <div className="space-y-4 w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">GenContract AI</h1>
            <p className="text-sm text-muted-foreground">Smart Contract Management</p>
            {!isApiConfigured && (
              <Badge variant="outline" className="mt-2 text-xs">
                Mock Mode
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <NavLinks />
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">GenContract AI</h1>
            {!isApiConfigured && (
              <Badge variant="outline" className="text-xs">
                Mock Mode
              </Badge>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="space-y-4 mt-8">
                <div className="space-y-2">
                  <NavLinks />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
