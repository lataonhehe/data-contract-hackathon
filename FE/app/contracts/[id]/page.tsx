"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContracts } from "@/hooks/use-contracts"
import { Edit, Trash2, ArrowLeft, Database, Shield } from "lucide-react"
import type { Contract } from "@/types/contract"
import { useEffect } from "react"

export default function ViewContractPage() {
  const params = useParams()
  const router = useRouter()
  const { getContract, fetchContractById, deleteContract } = useContracts()

  const contractId = params.id as string
  const contract = getContract(contractId)

  // Fetch contract from backend if not in state
  useEffect(() => {
    if (!contract && contractId) {
      fetchContractById(contractId)
    }
  }, [contract, contractId, fetchContractById])

  if (!contract) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Contract Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The contract you're looking for doesn't exist or has been deleted.
            </p>
            <Link href="/contracts">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Contracts
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

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

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this contract? This action cannot be undone.")) {
      deleteContract(contractId)
      router.push("/contracts")
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/contracts">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Contracts
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{contract.name}</h1>
                <p className="text-muted-foreground">{contract.description}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href={`/contracts/${contractId}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contract Metadata */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Contract ID</label>
                    <p className="font-mono text-sm">{contract.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(contract.status)}>{contract.status}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Owner</label>
                    <p>{contract.owner}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p>{new Date(contract.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p>{new Date(contract.updatedAt).toLocaleString()}</p>
                  </div>
                  {contract.metadata?.s3_path && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Storage Location</label>
                      <p className="text-xs font-mono text-muted-foreground break-all">{contract.metadata.s3_path}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/simulate?contract=${contractId}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Database className="mr-2 h-4 w-4" />
                      Simulate Data
                    </Button>
                  </Link>
                  <Link href={`/monitoring?contract=${contractId}`}>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Shield className="mr-2 h-4 w-4" />
                      View Violations
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Contract Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contract Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-6 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">{contract.content}</pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
