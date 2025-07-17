import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { FileText, Plus, MessageSquare, Database, Shield, ArrowRight } from "lucide-react"

const features = [
  {
    title: "Create Contract",
    description: "Generate smart contracts from natural language descriptions",
    icon: Plus,
    href: "/contracts",
    color: "text-green-600",
  },
  {
    title: "View All Contracts",
    description: "Browse and manage your existing data contracts",
    icon: FileText,
    href: "/contracts",
    color: "text-blue-600",
  },
  {
    title: "Query Assistant",
    description: "Ask questions about your contracts in natural language",
    icon: MessageSquare,
    href: "/query",
    color: "text-purple-600",
  },
  {
    title: "Simulate Data",
    description: "Generate test data for business intelligence and ML",
    icon: Database,
    href: "/simulate",
    color: "text-orange-600",
  },
  {
    title: "Monitor Violations",
    description: "Track contract compliance and security violations",
    icon: Shield,
    href: "/monitoring",
    color: "text-red-600",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Welcome to <span className="text-primary">GenContract AI</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Intelligent smart data contract management system that helps you create, manage, and monitor data sharing
              agreements with AI-powered automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create">
                <Button size="lg" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Contract
                </Button>
              </Link>
              <Link href="/contracts">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                  <FileText className="mr-2 h-5 w-5" />
                  View All Contracts
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">{feature.description}</CardDescription>
                    <Link href={feature.href}>
                      <Button variant="ghost" className="w-full justify-between">
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-primary">3</CardTitle>
                <CardDescription>Active Contracts</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-orange-600">2</CardTitle>
                <CardDescription>Recent Violations</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-green-600">98%</CardTitle>
                <CardDescription>Compliance Rate</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
