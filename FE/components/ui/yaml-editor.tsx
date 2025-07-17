"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { YAMLSyntaxHighlighter } from "./yaml-syntax-highlighter"
import { YAMLContractAnalyzer } from "./yaml-contract-analyzer"
import { CheckCircle, AlertTriangle, Eye, Edit3, Save, RotateCcw } from "lucide-react"

interface YAMLEditorProps {
  value: string
  onChange: (value: string) => void
  title?: string
  showPreview?: boolean
  showAnalyzer?: boolean
  placeholder?: string
}

interface YAMLValidationError {
  line: number
  message: string
  type: 'error' | 'warning'
}

export function YAMLEditor({ 
  value, 
  onChange, 
  title = "YAML Editor", 
  showPreview = true,
  showAnalyzer = false,
  placeholder = "Enter your YAML content here..."
}: YAMLEditorProps) {
  const [errors, setErrors] = useState<YAMLValidationError[]>([])
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Basic YAML validation
  const validateYAML = (content: string): YAMLValidationError[] => {
    const validationErrors: YAMLValidationError[] = []
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmed = line.trim()
      
      if (!trimmed || trimmed.startsWith('#')) return
      
      // Check for basic YAML syntax
      if (trimmed.includes(':') && !trimmed.match(/^[^:]+:\s*.*$/)) {
        validationErrors.push({
          line: lineNumber,
          message: 'Invalid key-value format',
          type: 'error'
        })
      }
      
      // Check for inconsistent indentation
      const indent = line.length - line.trimStart().length
      if (indent % 2 !== 0 && indent > 0) {
        validationErrors.push({
          line: lineNumber,
          message: 'Inconsistent indentation (should be multiples of 2)',
          type: 'warning'
        })
      }
      
      // Check for empty values
      if (trimmed.match(/^[^:]+:\s*$/)) {
        validationErrors.push({
          line: lineNumber,
          message: 'Empty value - consider adding a value or removing the key',
          type: 'warning'
        })
      }
    })
    
    return validationErrors
  }

  useEffect(() => {
    const validationErrors = validateYAML(value)
    setErrors(validationErrors)
  }, [value])

  const handleChange = (newValue: string) => {
    onChange(newValue)
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    setHasUnsavedChanges(false)
    // Additional save logic can be added here
  }

  const handleReset = () => {
    onChange('')
    setHasUnsavedChanges(false)
  }

  const getErrorCount = () => {
    return errors.filter(e => e.type === 'error').length
  }

  const getWarningCount = () => {
    return errors.filter(e => e.type === 'warning').length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center space-x-2">
            {showPreview && (
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'edit' | 'preview')}>
                <TabsList>
                  <TabsTrigger value="edit" className="flex items-center space-x-1">
                    <Edit3 className="h-3 w-3" />
                    <span>Edit</span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>Preview</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved changes
              </Badge>
            )}
            
            <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasUnsavedChanges}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* Validation Status */}
        {(getErrorCount() > 0 || getWarningCount() > 0) && (
          <div className="flex items-center space-x-4 text-sm">
            {getErrorCount() > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{getErrorCount()} error{getErrorCount() !== 1 ? 's' : ''}</span>
              </div>
            )}
            {getWarningCount() > 0 && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                <span>{getWarningCount()} warning{getWarningCount() !== 1 ? 's' : ''}</span>
              </div>
            )}
            {getErrorCount() === 0 && getWarningCount() === 0 && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Valid YAML</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'edit' | 'preview')}>
          <TabsContent value="edit" className="mt-0">
            <div className="space-y-4">
              <Textarea
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                rows={20}
                className="font-mono text-sm"
              />
              
              {/* Error Display */}
              {errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Validation Issues:</h4>
                  {errors.map((error, index) => (
                    <Alert key={index} variant={error.type === 'error' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Line {error.line}: {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="mt-0">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg border overflow-x-auto">
                <YAMLSyntaxHighlighter content={value} />
              </div>
              
              {showAnalyzer && value.trim() && (
                <YAMLContractAnalyzer content={value} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 