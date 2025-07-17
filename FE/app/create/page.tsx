"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContracts } from "@/hooks/use-contracts"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Wand2, Save } from "lucide-react"

export default function CreateContractPage() {
  const router = useRouter()
  const { createContract, generateContract } = useContracts()
  const { toast } = useToast()

  const [userEmail, setUserEmail] = useState("")
  const [description, setDescription] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "Please provide a description of your data-sharing needs.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const content = await generateContract(description)
      setGeneratedContent(content)

      toast({
        title: "Success",
        description: "Contract generated successfully! Review and save when ready.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!userEmail.trim() || !description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const newContract = await createContract({
        user: userEmail,
        request: description,
      })

      toast({
        title: "Success",
        description: "Contract created successfully!",
      })

      router.push(`/contracts/${newContract.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Contract</h1>
            <p className="text-muted-foreground">
              Describe your data-sharing needs in natural language and let AI generate a smart contract for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Contract Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userEmail">
                    Your Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="userEmail"
                    placeholder="Enter your email address"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Data-Sharing Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your data-sharing needs in natural language. For example: 'I need to share customer purchase data between our marketing and analytics teams for creating personalized recommendations, with strict privacy controls and GDPR compliance.'"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating || !description.trim()} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Contract...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Contract
                    </>
                  )}
                </Button>

                {generatedContent && (
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !userEmail.trim() || !description.trim()}
                    className="w-full"
                    variant="default"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Contract...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Contract
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Generated Contract Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Contract</CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedContent ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wand2 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Generated contract will appear here</p>
                    <p className="text-sm mt-2">Provide a description and click "Generate Contract" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm font-mono overflow-x-auto">{generatedContent}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
