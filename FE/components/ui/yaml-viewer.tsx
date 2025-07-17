"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, ChevronRight, Copy, Download, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { YAMLSyntaxHighlighter } from "./yaml-syntax-highlighter"

interface YAMLViewerProps {
  content: string
  title?: string
  showActions?: boolean
}

interface YAMLNode {
  key: string
  value: any
  level: number
  type: 'object' | 'array' | 'primitive'
  children?: YAMLNode[]
}

export function YAMLViewer({ content, title = "Contract Content", showActions = true }: YAMLViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')
  const { toast } = useToast()

  // Parse YAML content into a structured format
  const parseYAML = (yamlContent: string): YAMLNode[] => {
    const lines = yamlContent.split('\n')
    const nodes: YAMLNode[] = []
    const stack: YAMLNode[] = []

    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return

      const indent = line.length - line.trimStart().length
      const keyMatch = trimmed.match(/^([^:]+):\s*(.*)$/)
      
      if (keyMatch) {
        const [, key, value] = keyMatch
        const node: YAMLNode = {
          key: key.trim(),
          value: value.trim(),
          level: indent / 2,
          type: 'primitive'
        }

        // Determine if it's an object or array
        if (value.trim() === '') {
          node.type = 'object'
          node.children = []
        } else if (value.trim().startsWith('-')) {
          node.type = 'array'
          node.children = []
        }

        // Find parent based on indentation
        while (stack.length > 0 && stack[stack.length - 1].level >= node.level) {
          stack.pop()
        }

        if (stack.length > 0) {
          stack[stack.length - 1].children = stack[stack.length - 1].children || []
          stack[stack.length - 1].children!.push(node)
        } else {
          nodes.push(node)
        }

        stack.push(node)
      }
    })

    return nodes
  }

  const toggleSection = (path: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedSections(newExpanded)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Copied!",
        description: "Contract content copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
      })
    }
  }

  const downloadYAML = () => {
    const blob = new Blob([content], { type: 'application/x-yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contract.yaml'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded!",
      description: "Contract saved as contract.yaml",
    })
  }

  const renderNode = (node: YAMLNode, path: string = ''): React.ReactNode => {
    const currentPath = path ? `${path}.${node.key}` : node.key
    const isExpanded = expandedSections.has(currentPath)
    const hasChildren = node.children && node.children.length > 0

    return (
      <div key={currentPath} className="yaml-node">
        <div 
          className={`flex items-center py-1 hover:bg-muted/50 rounded px-2 -ml-2 ${
            hasChildren ? 'cursor-pointer' : ''
          }`}
          onClick={() => hasChildren && toggleSection(currentPath)}
        >
          {hasChildren && (
            <span className="mr-2 text-muted-foreground">
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </span>
          )}
          <span className="font-medium text-blue-600">{node.key}:</span>
          {node.type === 'primitive' && (
            <span className="ml-2 text-foreground">
              {typeof node.value === 'string' && node.value.startsWith('"') 
                ? node.value 
                : typeof node.value === 'string' && (node.value.includes(' ') || node.value === '')
                ? `"${node.value}"`
                : node.value}
            </span>
          )}
          {node.type === 'object' && !isExpanded && (
            <span className="ml-2 text-muted-foreground text-sm">{`{...}`}</span>
          )}
          {node.type === 'array' && !isExpanded && (
            <span className="ml-2 text-muted-foreground text-sm">{`[...]`}</span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-border pl-4">
            {node.children!.map((child, index) => renderNode(child, currentPath))}
          </div>
        )}
      </div>
    )
  }

  const parsedNodes = parseYAML(content)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {showActions && (
            <div className="flex items-center space-x-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'formatted' | 'raw')}>
                <TabsList>
                  <TabsTrigger value="formatted" className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>Formatted</span>
                  </TabsTrigger>
                  <TabsTrigger value="raw" className="flex items-center space-x-1">
                    <EyeOff className="h-3 w-3" />
                    <span>Raw</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadYAML}>
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'formatted' | 'raw')}>
          <TabsContent value="formatted" className="mt-0">
            <div className="bg-muted/30 p-4 rounded-lg border">
              {parsedNodes.length > 0 ? (
                <div className="space-y-1">
                  {parsedNodes.map((node) => renderNode(node))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No structured content found</p>
                  <p className="text-sm">Switch to Raw view to see the original content</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="raw" className="mt-0">
            <div className="bg-muted p-4 rounded-lg border overflow-x-auto">
              <YAMLSyntaxHighlighter content={content} />
            </div>
          </TabsContent>
        </Tabs>

        {/* YAML Statistics */}
        <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              {parsedNodes.length} top-level keys
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              {content.split('\n').length} lines
            </Badge>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="secondary" className="text-xs">
              {(content.length / 1024).toFixed(1)} KB
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 