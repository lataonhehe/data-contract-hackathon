"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Shield, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Settings
} from "lucide-react"

interface YAMLContractAnalyzerProps {
  content: string
}

interface ContractAnalysis {
  contractId?: string
  description?: string
  fields: Array<{
    name: string
    type: string
    description?: string
  }>
  constraints: Array<{
    field: string
    rule: string
  }>
  security: {
    encryption?: string
    accessControl?: string
    retentionPolicy?: string
  }
  quality: {
    freshness?: string
    completeness?: string
    validityChecks?: number
  }
  sla: {
    availability?: string
    updateCadence?: string
  }
  version?: string
  classification?: string
}

export function YAMLContractAnalyzer({ content }: YAMLContractAnalyzerProps) {
  const analyzeYAML = (yamlContent: string): ContractAnalysis => {
    const analysis: ContractAnalysis = {
      fields: [],
      constraints: [],
      security: {},
      quality: {},
      sla: {}
    }

    const lines = yamlContent.split('\n')
    let currentSection = ''
    let currentField: any = null

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return

      // Extract contract metadata
      if (trimmed.startsWith('contract_id:')) {
        analysis.contractId = trimmed.split(':')[1]?.trim()
      } else if (trimmed.startsWith('description:')) {
        analysis.description = trimmed.split(':')[1]?.trim()
      } else if (trimmed.startsWith('version:')) {
        analysis.version = trimmed.split(':')[1]?.trim()
      } else if (trimmed.startsWith('classification:')) {
        analysis.classification = trimmed.split(':')[1]?.trim()
      }

      // Detect sections
      if (trimmed === 'fields:' || trimmed.startsWith('fields:')) {
        currentSection = 'fields'
      } else if (trimmed === 'constraints:' || trimmed.startsWith('constraints:')) {
        currentSection = 'constraints'
      } else if (trimmed === 'security:' || trimmed.startsWith('security:')) {
        currentSection = 'security'
      } else if (trimmed === 'quality:' || trimmed.startsWith('quality:')) {
        currentSection = 'quality'
      } else if (trimmed === 'sla:' || trimmed.startsWith('sla:')) {
        currentSection = 'sla'
      }

      // Parse fields
      if (currentSection === 'fields' && trimmed.startsWith('- name:')) {
        currentField = { name: '', type: '', description: '' }
        const nameMatch = trimmed.match(/name:\s*(.+)/)
        if (nameMatch) currentField.name = nameMatch[1]
      } else if (currentSection === 'fields' && trimmed.startsWith('  type:')) {
        const typeMatch = trimmed.match(/type:\s*(.+)/)
        if (typeMatch && currentField) currentField.type = typeMatch[1]
      } else if (currentSection === 'fields' && trimmed.startsWith('  description:')) {
        const descMatch = trimmed.match(/description:\s*(.+)/)
        if (descMatch && currentField) currentField.description = descMatch[1]
      } else if (currentSection === 'fields' && !trimmed.startsWith('  ') && currentField) {
        if (currentField.name && currentField.type) {
          analysis.fields.push({ ...currentField })
          currentField = null
        }
      }

      // Parse constraints
      if (currentSection === 'constraints' && trimmed.startsWith('- field:')) {
        const fieldMatch = trimmed.match(/field:\s*(.+)/)
        const ruleMatch = trimmed.match(/rule:\s*(.+)/)
        if (fieldMatch && ruleMatch) {
          analysis.constraints.push({
            field: fieldMatch[1],
            rule: ruleMatch[1]
          })
        }
      }

      // Parse security settings
      if (currentSection === 'security') {
        if (trimmed.startsWith('encryption:')) {
          analysis.security.encryption = trimmed.split(':')[1]?.trim()
        } else if (trimmed.startsWith('access_control:')) {
          analysis.security.accessControl = trimmed.split(':')[1]?.trim()
        } else if (trimmed.startsWith('retention_policy:')) {
          analysis.security.retentionPolicy = trimmed.split(':')[1]?.trim()
        }
      }

      // Parse quality settings
      if (currentSection === 'quality') {
        if (trimmed.startsWith('freshness:')) {
          analysis.quality.freshness = trimmed.split(':')[1]?.trim()
        } else if (trimmed.startsWith('completeness:')) {
          analysis.quality.completeness = trimmed.split(':')[1]?.trim()
        } else if (trimmed.startsWith('validity_checks:')) {
          const checksMatch = trimmed.match(/validity_checks:\s*(\d+)/)
          if (checksMatch) analysis.quality.validityChecks = parseInt(checksMatch[1])
        }
      }

      // Parse SLA settings
      if (currentSection === 'sla') {
        if (trimmed.startsWith('availability:')) {
          analysis.sla.availability = trimmed.split(':')[1]?.trim()
        } else if (trimmed.startsWith('update_cadence:')) {
          analysis.sla.updateCadence = trimmed.split(':')[1]?.trim()
        }
      }
    })

    return analysis
  }

  const analysis = analyzeYAML(content)

  const getCompletenessScore = () => {
    let score = 0
    let total = 0

    if (analysis.contractId) { score++; total++ }
    if (analysis.description) { score++; total++ }
    if (analysis.fields.length > 0) { score++; total++ }
    if (analysis.constraints.length > 0) { score++; total++ }
    if (analysis.security.encryption) { score++; total++ }
    if (analysis.security.accessControl) { score++; total++ }
    if (analysis.quality.freshness) { score++; total++ }
    if (analysis.sla.availability) { score++; total++ }

    return total > 0 ? Math.round((score / total) * 100) : 0
  }

  const getSecurityScore = () => {
    let score = 0
    let total = 0

    if (analysis.security.encryption) { score++; total++ }
    if (analysis.security.accessControl) { score++; total++ }
    if (analysis.security.retentionPolicy) { score++; total++ }
    if (analysis.constraints.some(c => c.rule.includes('encrypt'))) { score++; total++ }

    return total > 0 ? Math.round((score / total) * 100) : 0
  }

  return (
    <div className="space-y-6">
      {/* Contract Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Contract Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Contract ID</label>
              <p className="font-mono text-sm">{analysis.contractId || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Version</label>
              <p className="text-sm">{analysis.version || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Classification</label>
              <Badge variant={analysis.classification === 'Confidential' ? 'destructive' : 'secondary'}>
                {analysis.classification || 'Not specified'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {analysis.description || 'No description provided'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Fields ({analysis.fields.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analysis.fields.length > 0 ? (
            <div className="space-y-3">
              {analysis.fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <div className="font-medium">{field.name}</div>
                    <div className="text-sm text-muted-foreground">{field.type}</div>
                    {field.description && (
                      <div className="text-xs text-muted-foreground mt-1">{field.description}</div>
                    )}
                  </div>
                  <Badge variant="outline">{field.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No fields defined</p>
          )}
        </CardContent>
      </Card>

      {/* Constraints & Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Constraints ({analysis.constraints.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysis.constraints.length > 0 ? (
              <div className="space-y-2">
                {analysis.constraints.map((constraint, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm font-medium">{constraint.field}</span>
                    <Badge variant="secondary" className="text-xs">{constraint.rule}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No constraints defined</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Security & Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Encryption</label>
              <p className="text-sm">{analysis.security.encryption || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Access Control</label>
              <p className="text-sm">{analysis.security.accessControl || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Data Freshness</label>
              <p className="text-sm">{analysis.quality.freshness || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Completeness</label>
              <p className="text-sm">{analysis.quality.completeness || 'Not specified'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Contract Quality</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Completeness</span>
              <span className="text-sm text-muted-foreground">{getCompletenessScore()}%</span>
            </div>
            <Progress value={getCompletenessScore()} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Security</span>
              <span className="text-sm text-muted-foreground">{getSecurityScore()}%</span>
            </div>
            <Progress value={getSecurityScore()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* SLA Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Service Level Agreement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Availability</label>
              <p className="text-sm">{analysis.sla.availability || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Update Cadence</label>
              <p className="text-sm">{analysis.sla.updateCadence || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 