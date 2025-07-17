"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useContracts } from "@/hooks/use-contracts"
import { Send, MessageSquare, Loader2, ExternalLink } from "lucide-react"

export default function QueryPage() {
  const { queryAssistant, queryHistory, contracts } = useContracts()
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || isLoading) return

    setIsLoading(true)
    try {
      await queryAssistant(question)
      setQuestion("")
    } catch (error) {
      console.error("Query failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getContractName = (contractId: string) => {
    const contract = contracts.find((c) => c.id === contractId)
    return contract?.name || contractId
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Query Assistant</h1>
            <p className="text-muted-foreground">
              Ask questions about your contracts in natural language and get intelligent responses.
            </p>
          </div>

          {/* Query Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Ask a Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex space-x-4">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Do we have any contracts related to credit card transactions?"
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !question.trim()}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sample Questions */}
          {queryHistory.length === 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Sample Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "Do we have any contracts related to financial data?",
                    "Show me all active contracts with violations",
                    "What contracts involve customer data sharing?",
                    "Which contracts are owned by the research team?",
                    "Are there any expired contracts that need renewal?",
                    "What are the compliance requirements for our contracts?",
                  ].map((sampleQuestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto p-4 justify-start bg-transparent"
                      onClick={() => setQuestion(sampleQuestion)}
                      disabled={isLoading}
                    >
                      <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm">{sampleQuestion}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Query History */}
          {queryHistory.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Query History</h2>
              {queryHistory.map((query) => (
                <Card key={query.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {/* Question */}
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary text-primary-foreground rounded-full p-2 flex-shrink-0">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{query.question}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(query.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Answer */}
                      <div className="flex items-start space-x-3">
                        <div className="bg-muted rounded-full p-2 flex-shrink-0">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground">{query.answer}</p>

                          {/* Related Contracts */}
                          {query.relatedContracts.length > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium text-muted-foreground mb-2">Related Contracts:</p>
                              <div className="flex flex-wrap gap-2">
                                {query.relatedContracts.map((contractId) => (
                                  <Link key={contractId} href={`/contracts/${contractId}`}>
                                    <Badge variant="secondary" className="hover:bg-secondary/80 cursor-pointer">
                                      {getContractName(contractId)}
                                      <ExternalLink className="ml-1 h-3 w-3" />
                                    </Badge>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
