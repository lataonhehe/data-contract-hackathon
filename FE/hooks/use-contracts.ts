"use client"

import { useState, useEffect } from "react"
import type { Contract, Violation, QueryResponse } from "@/types/contract"
import { api } from "@/lib/api"
import { mockContracts, mockViolations } from "@/lib/mock-data"

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [violations, setViolations] = useState<Violation[]>([])
  const [queryHistory, setQueryHistory] = useState<QueryResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize with data (try API first, fallback to mock)
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      // Try to load from API first
      if (api.utils.isApiConfigured()) {
        try {
          console.log("Loading contracts from API...")
          const contractsData = await api.contracts.getAll()
          console.log("Contracts loaded:", contractsData)
          setContracts(contractsData)

          // Load violations if API supports it
          try {
            const violationsData = await api.violations.getAll()
            setViolations(violationsData)
          } catch (violationError) {
            console.warn("Violations API not available, using mock data")
            setViolations(mockViolations)
          }
        } catch (apiError) {
          console.warn("API not available, using mock data:", apiError)
          setContracts(mockContracts)
          setViolations(mockViolations)
        }
      } else {
        // Use mock data if no API URL configured
        console.log("No API URL configured, using mock data")
        setContracts(mockContracts)
        setViolations(mockViolations)
      }

      setError(null)
    } catch (err) {
      console.error("Error loading initial data:", err)
      setError(api.utils.handleError(err))
      // Fallback to mock data on error
      setContracts(mockContracts)
      setViolations(mockViolations)
    } finally {
      setLoading(false)
    }
  }

  const createContract = async (contractData: { user: string; request: string; content?: string }) => {
    setLoading(true)
    try {
      if (api.utils.isApiConfigured()) {
        let newContract
        if (contractData.content) {
          // Save pre-generated contract
          newContract = await api.contracts.saveGenerated({
            user: contractData.user,
            request: contractData.request,
            content: contractData.content,
          })
        } else {
          // Use real API to generate and save
          newContract = await api.contracts.create({
            user: contractData.user,
            request: contractData.request,
          })
        }
        setContracts((prev) => [...prev, newContract])
        return newContract
      } else {
        // Use mock implementation
        const newContract: Contract = {
          id: `contract-${Date.now()}`,
          name: `Contract for ${contractData.request.slice(0, 30)}...`,
          description: contractData.request,
          owner: contractData.user,
          status: "DRAFT",
          content: contractData.content || generateMockContract(contractData.request),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setContracts((prev) => [...prev, newContract])
        return newContract
      }
    } catch (err) {
      console.error("Error creating contract:", err)
      setError(api.utils.handleError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    setLoading(true)
    try {
      if (api.utils.isApiConfigured()) {
        // Use real API
        console.log("Updating contract via API:", id, updates)
        const updatedContract = await api.contracts.update(id, updates)
        console.log("Contract updated:", updatedContract)
        setContracts((prev) => prev.map((contract) => (contract.id === id ? updatedContract : contract)))
      } else {
        // Use mock implementation
        setContracts((prev) =>
          prev.map((contract) =>
            contract.id === id ? { ...contract, ...updates, updatedAt: new Date().toISOString() } : contract,
          ),
        )
      }
    } catch (err) {
      console.error("Error updating contract:", err)
      setError(api.utils.handleError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteContract = async (id: string) => {
    setLoading(true)
    try {
      if (api.utils.isApiConfigured()) {
        // Use real API
        console.log("Deleting contract via API:", id)
        await api.contracts.delete(id)
        console.log("Contract deleted:", id)
      }

      // Update local state regardless of API availability
      setContracts((prev) => prev.filter((contract) => contract.id !== id))
      setViolations((prev) => prev.filter((violation) => violation.contractId !== id))
    } catch (err) {
      console.error("Error deleting contract:", err)
      setError(api.utils.handleError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const getContract = (id: string) => {
    return contracts.find((contract) => contract.id === id)
  }

  const fetchContractById = async (id: string): Promise<Contract | null> => {
    setLoading(true)
    try {
      if (api.utils.isApiConfigured()) {
        console.log("Fetching contract by ID via API:", id)
        const contract = await api.contracts.getById(id)
        console.log("Contract fetched:", contract)

        // Update local state with the fetched contract
        setContracts((prev) => {
          const existingIndex = prev.findIndex((c) => c.id === id)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = contract
            return updated
          } else {
            return [...prev, contract]
          }
        })

        return contract
      } else {
        // Use local state
        return getContract(id) || null
      }
    } catch (err) {
      console.error("Error fetching contract by ID:", err)
      setError(api.utils.handleError(err))
      return null
    } finally {
      setLoading(false)
    }
  }

  const generateContract = async (description: string): Promise<string> => {
    setLoading(true)
    try {
      if (api.utils.isApiConfigured()) {
        try {
          // Try to use real API for generation
          console.log("Generating contract via API:", description)
          const result = await api.contracts.generate(description)
          console.log("Contract generated:", result)
          return result.content
        } catch (apiError) {
          console.warn("Contract generation API not available, using mock")
          // Fallback to mock generation
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return generateMockContract(description)
        }
      } else {
        // Use mock implementation
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return generateMockContract(description)
      }
    } catch (err) {
      console.error("Error generating contract:", err)
      setError(api.utils.handleError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const generateContractStream = async (
    description: string,
    onChunk: (chunk: string) => void,
    onComplete: (fullContent: string) => void,
    onError: (error: string) => void
  ) => {
    setLoading(true)
    try {
      if (api.utils.isApiConfigured()) {
        await api.contracts.generateStream(description, onChunk, onComplete, onError)
      } else {
        // Fallback to mock streaming
        let fullContent = ""
        for (let i = 0; i < 5; i++) {
          const chunk = `# Mock contract chunk ${i + 1}\n`
          fullContent += chunk
          onChunk(chunk)
          await new Promise((resolve) => setTimeout(resolve, 400))
        }
        onComplete(fullContent)
      }
    } catch (err) {
      setError(api.utils.handleError(err))
      onError("Streaming failed")
    } finally {
      setLoading(false)
    }
  }

  const queryAssistant = async (question: string): Promise<QueryResponse> => {
    setLoading(true)
    try {
      if (api.utils.isApiConfigured()) {
        try {
          // Try to use real API for queries
          console.log("Querying assistant via API:", question)
          const queryResponse = await api.query.ask(question)
          console.log("Query response:", queryResponse)
          setQueryHistory((prev) => [queryResponse, ...prev])
          return queryResponse
        } catch (apiError) {
          console.warn("Query API not available, using mock")
          // Fallback to mock query
          await new Promise((resolve) => setTimeout(resolve, 1500))
          const response = generateMockQueryResponse(question, contracts)
          setQueryHistory((prev) => [response, ...prev])
          return response
        }
      } else {
        // Use mock implementation
        await new Promise((resolve) => setTimeout(resolve, 1500))
        const response = generateMockQueryResponse(question, contracts)
        setQueryHistory((prev) => [response, ...prev])
        return response
      }
    } catch (err) {
      console.error("Error querying assistant:", err)
      setError(api.utils.handleError(err))
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    contracts,
    violations,
    queryHistory,
    loading,
    error,

    // Basic CRUD operations (with API integration)
    createContract,
    updateContract,
    deleteContract,
    getContract,
    fetchContractById,
    generateContract,
    generateContractStream,
    queryAssistant,

    // Utility methods
    clearError: () => setError(null),
    refresh: loadInitialData,
  }
}

// Helper functions for mock data
function generateMockContract(description: string): string {
  return `# Generated Smart Data Contract

## Contract Overview
Generated from: "${description}"

## Parties
- Data Provider: [To be specified]
- Data Consumer: [To be specified]

## Data Scope
- Data types: [Inferred from description]
- Data sources: [To be specified]
- Data volume: [To be estimated]

## Usage Terms
- Purpose limitation: Data usage restricted to specified purposes
- Access controls: Role-based access implementation required
- Data retention: [To be defined based on requirements]

## Compliance Framework
- Privacy regulations: GDPR, CCPA compliance required
- Security standards: Industry-standard encryption
- Audit requirements: Regular compliance monitoring

## Technical Specifications
- Data format: JSON/XML structured data
- Transfer protocol: HTTPS with TLS 1.3
- Authentication: OAuth 2.0 or API key based

## Monitoring and Enforcement
- Real-time violation detection
- Automated compliance reporting
- Breach notification procedures

## Terms and Conditions
- Contract duration: [To be specified]
- Termination clauses: Standard termination procedures
- Dispute resolution: Arbitration process defined

---
*This contract was auto-generated and requires review and customization*`
}

function generateMockQueryResponse(question: string, contracts: Contract[]): QueryResponse {
  const lowerQuestion = question.toLowerCase()
  let answer = ""

  if (lowerQuestion.includes("credit card") || lowerQuestion.includes("financial")) {
    answer =
      'I found contracts related to financial data processing. The "Financial Data Processing Contract" handles transaction data for fraud detection with PCI DSS compliance requirements.'
  } else if (lowerQuestion.includes("customer") || lowerQuestion.includes("marketing")) {
    answer =
      'There are customer data sharing agreements in the system. The "Customer Data Sharing Agreement" covers customer analytics data sharing between marketing and sales teams.'
  } else if (lowerQuestion.includes("research") || lowerQuestion.includes("university")) {
    answer =
      'I found a research collaboration contract. The "Research Data Collaboration" agreement covers data sharing with an external university for joint research projects.'
  } else if (lowerQuestion.includes("violation") || lowerQuestion.includes("breach")) {
    answer =
      "Recent violations include unauthorized access attempts and data retention issues. Check the monitoring page for detailed violation reports."
  } else {
    answer = `I found ${contracts.length} contracts in the system. Based on your question, you might be interested in reviewing the contract list or using more specific search terms.`
  }

  return {
    id: `query-${Date.now()}`,
    question,
    answer,
    relatedContracts: findRelatedContracts(question, contracts),
    timestamp: new Date().toISOString(),
  }
}

function findRelatedContracts(question: string, contracts: Contract[]): string[] {
  const lowerQuestion = question.toLowerCase()

  return contracts
    .filter(
      (contract) =>
        contract.name.toLowerCase().includes(lowerQuestion) ||
        contract.description.toLowerCase().includes(lowerQuestion) ||
        contract.content.toLowerCase().includes(lowerQuestion),
    )
    .map((contract) => contract.id)
}
