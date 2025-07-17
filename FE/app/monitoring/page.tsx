"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContracts } from "@/hooks/use-contracts"
import { Shield, AlertTriangle, Search, ExternalLink, TrendingUp } from "lucide-react"
import type { Violation } from "@/types/contract"

export default function MonitoringPage() {
  const searchParams = useSearchParams()
  const { violations, contracts } = useContracts()
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [contractFilter, setContractFilter] = useState<string>(searchParams.get("contract") || "all")

  const filteredViolations = violations.filter((violation) => {
    const matchesSearch =
      violation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.contractName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === "all" || violation.severity === severityFilter
    const matchesContract = contractFilter === "all" || violation.contractId === contractFilter
    return matchesSearch && matchesSeverity && matchesContract
  })

  const getSeverityColor = (severity: Violation["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity: Violation["severity"]) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const severityStats = {
    CRITICAL: violations.filter((v) => v.severity === "CRITICAL").length,
    HIGH: violations.filter((v) => v.severity === "HIGH").length,
    MEDIUM: violations.filter((v) => v.severity === "MEDIUM").length,
    LOW: violations.filter((v) => v.severity === "LOW").length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Contract Monitoring</h1>
            <p className="text-muted-foreground">
              Monitor contract compliance and track security violations across your data contracts.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical</p>
                    <p className="text-2xl font-bold text-red-600">{severityStats.CRITICAL}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High</p>
                    <p className="text-2xl font-bold text-orange-600">{severityStats.HIGH}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Medium</p>
                    <p className="text-2xl font-bold text-yellow-600">{severityStats.MEDIUM}</p>
                  </div>
                  <Shield className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Low</p>
                    <p className="text-2xl font-bold text-blue-600">{severityStats.LOW}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Violation Log
              </CardTitle>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search violations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={contractFilter} onValueChange={setContractFilter}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Filter by contract" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contracts</SelectItem>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        {contract.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredViolations.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || severityFilter !== "all" || contractFilter !== "all"
                      ? "No violations match your search criteria."
                      : "No violations detected. Your contracts are compliant!"}
                  </p>
                  {violations.length === 0 && (
                    <div className="flex items-center justify-center text-green-600">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <span className="text-sm font-medium">100% Compliance Rate</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Contract</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredViolations.map((violation) => (
                        <TableRow key={violation.id}>
                          <TableCell>
                            <div className="text-sm">{new Date(violation.timestamp).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(violation.timestamp).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{violation.contractName}</div>
                            <div className="text-sm text-muted-foreground font-mono">{violation.contractId}</div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">{violation.description}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(violation.severity)}>
                              <div className="flex items-center">
                                {getSeverityIcon(violation.severity)}
                                <span className="ml-1">{violation.severity}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/contracts/${violation.contractId}`}>
                              <Button variant="ghost" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
