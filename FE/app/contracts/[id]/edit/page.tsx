"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContracts } from "@/hooks/use-contracts"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2, Wand2 } from "lucide-react"
import type { Contract } from "@/types/contract"

export default function EditContractPage() {
  const params = useParams()
  const router = useRouter()
  const { getContract, fetchContractById, updateContract, generateContract } = useContracts()
  const { toast } = useToast()

  const contractId = params.id as string
  const contract = getContract(contractId)

  // Fetch contract from backend if not in state
  useEffect(() => {
    if (!contract && contractId) {
      fetchContractById(contractId)
    }
  }, [contract, contractId, fetchContractById])

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [owner, setOwner] = useState("")
  const [status, setStatus] = useState<Contract["status"]>("DRAFT")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  useEffect(() => {
    if (contract) {
      setName(contract.name)
      setDescription(contract.description)
      setOwner(contract.owner)
      setStatus(contract.status)
      setContent(contract.content)
    }
  }, [contract])

  if (!contract) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Contract Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The contract you're trying to edit doesn't exist or has been deleted.
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

  const handleSave = async () => {
    if (!name.trim() || !owner.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      updateContract(contractId, {
        name,
        description,
        owner,
        status,
        content,
      })

      toast({
        title: "Success",
        description: "Contract updated successfully!",
      })

      router.push(`/contracts/${contractId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRegenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description to regenerate the contract.",
        variant: "destructive",
      })
      return
    }

    setIsRegenerating(true)
    try {
      const newContent = await generateContract(description)
      setContent(newContent)

      toast({
        title: "Success",
        description: "Contract regenerated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRegenerating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href={`/contracts/${contractId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Contract
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Edit Contract</h1>
                <p className="text-muted-foreground">Modify contract details and content</p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Contract Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter contract name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the contract purpose"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner">
                    Owner <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="owner"
                    type="email"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Enter owner email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: Contract["status"]) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="VIOLATED">Violated</SelectItem>
                      <SelectItem value="EXPIRED">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !description.trim()}
                  variant="outline"
                  className="w-full bg-transparent"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Regenerate Contract
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Content Section */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="content">
                    Content <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Contract content in YAML or markdown format"
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
