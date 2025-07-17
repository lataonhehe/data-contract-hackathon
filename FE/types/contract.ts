export interface Contract {
  // Frontend interface (what the UI expects)
  id: string
  name: string
  description: string
  owner: string
  status: "DRAFT" | "ACTIVE" | "VIOLATED" | "EXPIRED"
  content: string
  createdAt: string
  updatedAt: string
  // Additional fields
  version?: number
  tags?: string[]
  metadata?: Record<string, any>
}

// Backend response interface (updated to match your Lambda response)
export interface BackendContract {
  contract_id: string
  owner: string
  created_time: string
  s3_path: string
  status: "DRAFT" | "ACTIVE" | "VIOLATED" | "EXPIRED"
  yaml: string // The YAML content of the contract
  // Additional fields that might be returned
  updated_time?: string
  version?: number
  tags?: string[]
  metadata?: Record<string, any>
}

export interface BackendContractsResponse {
  contracts: BackendContract[]
}

export interface Violation {
  id: string
  contractId: string
  contractName: string
  description: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  timestamp: string
  status?: "open" | "investigating" | "resolved" | "dismissed"
  assignedTo?: string
  notes?: string
}

export interface QueryResponse {
  id: string
  question: string
  answer: string
  relatedContracts: string[]
  timestamp: string
  responseTime?: number
  confidence?: number
  sources?: string[]
}

// Request types for Lambda integration
export interface CreateContractRequest {
  user: string
  request: string
}

export interface UpdateContractRequest {
  name?: string
  description?: string
  owner?: string
  status?: "DRAFT" | "ACTIVE" | "VIOLATED" | "EXPIRED"
  content?: string
  tags?: string[]
  metadata?: Record<string, any>
}
