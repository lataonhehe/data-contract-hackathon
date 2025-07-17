"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface YAMLSyntaxHighlighterProps {
  content: string
  className?: string
}

export function YAMLSyntaxHighlighter({ content, className }: YAMLSyntaxHighlighterProps) {
  const highlightYAML = (yamlContent: string): React.ReactNode[] => {
    const lines = yamlContent.split('\n')
    
    return lines.map((line, index) => {
      const trimmed = line.trim()
      const indent = line.length - line.trimStart().length
      const indentSpaces = ' '.repeat(indent)
      
      if (!trimmed) {
        return <div key={index} className="h-4"></div>
      }
      
      if (trimmed.startsWith('#')) {
        return (
          <div key={index} className="flex">
            <span className="text-gray-500 select-none">{indentSpaces}</span>
            <span className="text-green-600">{trimmed}</span>
          </div>
        )
      }
      
      // Match YAML key-value pairs
      const keyValueMatch = trimmed.match(/^([^:]+):\s*(.*)$/)
      if (keyValueMatch) {
        const [, key, value] = keyValueMatch
        
        return (
          <div key={index} className="flex">
            <span className="text-gray-500 select-none">{indentSpaces}</span>
            <span className="text-blue-600 font-medium">{key}:</span>
            {value && (
              <>
                <span className="text-gray-500 mx-1"> </span>
                <span className={cn(
                  value.startsWith('"') || value.startsWith("'") 
                    ? "text-green-600" 
                    : /^\d+$/.test(value)
                    ? "text-orange-600"
                    : /^(true|false)$/i.test(value)
                    ? "text-purple-600"
                    : "text-gray-800"
                )}>
                  {value}
                </span>
              </>
            )}
          </div>
        )
      }
      
      // Match array items
      const arrayMatch = trimmed.match(/^-\s*(.*)$/)
      if (arrayMatch) {
        const [, value] = arrayMatch
        
        return (
          <div key={index} className="flex">
            <span className="text-gray-500 select-none">{indentSpaces}</span>
            <span className="text-red-500 font-medium">-</span>
            {value && (
              <>
                <span className="text-gray-500 mx-1"> </span>
                <span className={cn(
                  value.startsWith('"') || value.startsWith("'") 
                    ? "text-green-600" 
                    : /^\d+$/.test(value)
                    ? "text-orange-600"
                    : /^(true|false)$/i.test(value)
                    ? "text-purple-600"
                    : "text-gray-800"
                )}>
                  {value}
                </span>
              </>
            )}
          </div>
        )
      }
      
      // Match multi-line strings
      if (trimmed.startsWith('|') || trimmed.startsWith('>')) {
        return (
          <div key={index} className="flex">
            <span className="text-gray-500 select-none">{indentSpaces}</span>
            <span className="text-yellow-600 font-medium">{trimmed[0]}</span>
            <span className="text-gray-800 ml-1">{trimmed.slice(1)}</span>
          </div>
        )
      }
      
      // Default case
      return (
        <div key={index} className="flex">
          <span className="text-gray-500 select-none">{indentSpaces}</span>
          <span className="text-gray-800">{trimmed}</span>
        </div>
      )
    })
  }

  return (
    <div className={cn("font-mono text-sm leading-relaxed", className)}>
      {highlightYAML(content)}
    </div>
  )
} 