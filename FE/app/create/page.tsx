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
import { useRef } from "react"

export default function CreateContractPage() {
  const router = useRouter()
  const { createContract, generateContractStream } = useContracts()
  const { toast } = useToast()

  const [userEmail, setUserEmail] = useState("")
  const [description, setDescription] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [streamError, setStreamError] = useState<string | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [editableContent, setEditableContent] = useState("")
  const abortRef = useRef<{ aborted: boolean }>({ aborted: false })

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
    setGeneratedContent("")
    setEditableContent("")
    setStreamError(null)
    abortRef.current.aborted = false
    try {
      await generateContractStream(
        description,
        (chunk) => {
          if (!abortRef.current.aborted) {
            setGeneratedContent((prev) => prev + chunk)
            setEditableContent((prev) => prev + chunk)
          }
        },
        (fullContent) => {
          if (!abortRef.current.aborted) {
            setGeneratedContent(fullContent)
            setEditableContent(fullContent)
            setIsGenerating(false)
            toast({
              title: "Success",
              description: "Contract generated successfully! Review, edit, and save when ready.",
            })
          }
        },
        (error) => {
          setStreamError(error)
          setIsGenerating(false)
          toast({
            title: "Error",
            description: error,
            variant: "destructive",
          })
        }
      )
    } catch (error) {
      setStreamError("Streaming failed")
      setIsGenerating(false)
    }
  }

  const handleCancelStream = () => {
    abortRef.current.aborted = true
    setIsGenerating(false)
    toast({
      title: "Cancelled",
      description: "Contract generation was cancelled.",
      variant: "destructive",
    })
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
        content: editableContent,
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
                    disabled={isGenerating || !!generatedContent}
                  />
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating || !description.trim() || !!generatedContent} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Contract...
                      <Button onClick={handleCancelStream} variant="outline" className="ml-4" type="button">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Contract
                    </>
                  )}
                </Button>
                {/* Agreement and email input shown only after generation */}
                {generatedContent && (
                  <>
                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        id="agree"
                        type="checkbox"
                        checked={agreed}
                        onChange={e => setAgreed(e.target.checked)}
                        className="form-checkbox h-4 w-4 text-primary"
                      />
                      <Label htmlFor="agree" className="text-sm">I have reviewed and agree to the generated contract</Label>
                    </div>
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="userEmail">
                        Your Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="userEmail"
                        placeholder="Enter your email address"
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        disabled={!agreed}
                      />
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !userEmail.trim() || !description.trim() || !agreed}
                      className="w-full mt-2"
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
                  </>
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
                      <Textarea
                        value={editableContent}
                        onChange={e => setEditableContent(e.target.value)}
                        rows={20}
                        className="font-mono text-sm w-full"
                      />
                    </div>
                    {streamError && <div className="text-red-500 text-sm">{streamError}</div>}
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
