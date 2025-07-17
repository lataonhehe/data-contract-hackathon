"use client"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContracts } from "@/hooks/use-contracts"
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react"
import type { Contract } from "@/types/contract"

export default function ContractsPage() {
  const { contracts, deleteContract } = useContracts()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: Contract["status"]) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800"
      case "VIOLATED":
        return "bg-red-100 text-red-800"
      case "EXPIRED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDelete = (contractId: string) => {
    if (confirm("Are you sure you want to delete this contract? This action cannot be undone.")) {
      deleteContract(contractId)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Data Contracts</h1>
              <p className="text-muted-foreground">Manage and monitor your smart data contracts</p>
            </div>
            <Link href="/create">
              <Button className="mt-4 md:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Create New Contract
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contract Management</CardTitle>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contracts by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="VIOLATED">Violated</SelectItem>
                    <SelectItem value="EXPIRED">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredContracts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== "all"
                      ? "No contracts match your search criteria."
                      : "No contracts found. Create your first contract to get started."}
                  </p>
                  <Link href="/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Contract
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contract ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-mono text-sm">{contract.id}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{contract.name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {contract.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{contract.owner}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
                          </TableCell>
                          <TableCell>{new Date(contract.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Link href={`/contracts/${contract.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/contracts/${contract.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(contract.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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
