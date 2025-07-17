"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useContracts } from "@/hooks/use-contracts"
import { useToast } from "@/hooks/use-toast"
import { Database, Download, Loader2, BarChart3, Brain } from "lucide-react"

export default function SimulatePage() {
  const searchParams = useSearchParams()
  const { contracts } = useContracts()
  const { toast } = useToast()

  const [selectedContract, setSelectedContract] = useState("")
  const [purpose, setPurpose] = useState<"BI" | "ML" | "">("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<any>(null)

  useEffect(() => {
    const contractParam = searchParams.get("contract")
    if (contractParam && contracts.find((c) => c.id === contractParam)) {
      setSelectedContract(contractParam)
    }
  }, [searchParams, contracts])

  const handleGenerate = async () => {
    if (!selectedContract || !purpose) {
      toast({
        title: "Error",
        description: "Please select a contract and purpose before generating data.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      // Simulate data generation delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      const contract = contracts.find((c) => c.id === selectedContract)
      const mockData = generateMockData(contract?.name || "Contract", purpose)

      setGeneratedData(mockData)

      toast({
        title: "Success",
        description: `Simulated data generated successfully for ${purpose} purposes!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate simulated data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedData) return

    const dataStr = JSON.stringify(generatedData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement("a")
    link.href = url
    link.download = `simulated-data-${selectedContract}-${purpose.toLowerCase()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Data downloaded successfully!",
    })
  }

  const selectedContractData = contracts.find((c) => c.id === selectedContract)

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />

      <main className="flex-1 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Simulate Data</h1>
            <p className="text-muted-foreground">
              Generate simulated data from your contracts for Business Intelligence or Machine Learning purposes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Data Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Contract</label>
                  <Select value={selectedContract} onValueChange={setSelectedContract}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a contract to simulate data from" />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{contract.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {contract.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedContractData && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Selected Contract</h4>
                    <p className="text-sm text-muted-foreground mb-2">{selectedContractData.description}</p>
                    <div className="flex items-center space-x-2">
                      <Badge className="text-xs">{selectedContractData.status}</Badge>
                      <span className="text-xs text-muted-foreground">Owner: {selectedContractData.owner}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Purpose</label>
                  <Select value={purpose} onValueChange={(value: "BI" | "ML") => setPurpose(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the purpose for data generation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BI">
                        <div className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Business Intelligence (BI)
                        </div>
                      </SelectItem>
                      <SelectItem value="ML">
                        <div className="flex items-center">
                          <Brain className="mr-2 h-4 w-4" />
                          Machine Learning (ML)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {purpose && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      {purpose === "BI" ? "Business Intelligence" : "Machine Learning"} Data
                    </h4>
                    <p className="text-sm text-blue-700">
                      {purpose === "BI"
                        ? "Generated data will be optimized for reporting, dashboards, and business analytics with aggregated metrics and KPIs."
                        : "Generated data will include features suitable for training machine learning models with proper data types and distributions."}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedContract || !purpose}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Data...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Generate Simulated Data
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Data</CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedData ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>Generated data will appear here</p>
                    <p className="text-sm mt-2">Select a contract and purpose, then click "Generate Simulated Data"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Data Generated Successfully</h4>
                        <p className="text-sm text-muted-foreground">
                          {generatedData.records.length} records generated for {purpose} purposes
                        </p>
                      </div>
                      <Button onClick={handleDownload} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                      <pre className="text-sm font-mono">{JSON.stringify(generatedData, null, 2)}</pre>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Data Format:</span>
                        <span className="ml-2">JSON</span>
                      </div>
                      <div>
                        <span className="font-medium">File Size:</span>
                        <span className="ml-2">{(JSON.stringify(generatedData).length / 1024).toFixed(1)} KB</span>
                      </div>
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

function generateMockData(contractName: string, purpose: "BI" | "ML") {
  const baseData = {
    metadata: {
      contract: contractName,
      purpose,
      generated_at: new Date().toISOString(),
      data_type: purpose === "BI" ? "aggregated_metrics" : "training_features",
    },
    records: [],
  }

  if (purpose === "BI") {
    // Generate BI-focused data with aggregated metrics
    baseData.records = Array.from({ length: 50 }, (_, i) => ({
      id: `record_${i + 1}`,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      user_segment: ["premium", "standard", "basic"][Math.floor(Math.random() * 3)],
      transaction_count: Math.floor(Math.random() * 100) + 1,
      total_value: Math.round((Math.random() * 10000 + 100) * 100) / 100,
      conversion_rate: Math.round(Math.random() * 100 * 100) / 100,
      engagement_score: Math.round(Math.random() * 10 * 100) / 100,
      region: ["North", "South", "East", "West"][Math.floor(Math.random() * 4)],
    }))
  } else {
    // Generate ML-focused data with features
    baseData.records = Array.from({ length: 100 }, (_, i) => ({
      id: `sample_${i + 1}`,
      features: {
        age: Math.floor(Math.random() * 60) + 18,
        income: Math.floor(Math.random() * 100000) + 30000,
        credit_score: Math.floor(Math.random() * 400) + 400,
        account_balance: Math.round(Math.random() * 50000 * 100) / 100,
        transaction_frequency: Math.floor(Math.random() * 50) + 1,
        days_since_last_login: Math.floor(Math.random() * 30),
        product_usage_score: Math.round(Math.random() * 100 * 100) / 100,
      },
      target: Math.random() > 0.7 ? 1 : 0, // Binary classification target
      label: Math.random() > 0.7 ? "high_value" : "standard",
    }))
  }

  return baseData
}
