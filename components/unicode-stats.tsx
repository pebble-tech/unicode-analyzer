"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface UnicodeStatsProps {
  analysis: {
    totalCharacters: number
    visibleCharacters: number
    invisibleCharacters: number
    suspiciousCharacters: Array<{
      char: string
      codePoint: number
      index: number
      description: string
    }>
    categories: Record<string, number>
  }
}

interface SuspiciousCharactersPanelProps {
  suspiciousCharacters: Array<{
    char: string
    codePoint: number
    index: number
    description: string
  }>
}

function SuspiciousCharactersPanel({ suspiciousCharacters }: SuspiciousCharactersPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const MAX_VISIBLE_ITEMS = 8
  
  // Group suspicious characters by code point to avoid duplicates
  const uniqueSuspicious = new Map()
  suspiciousCharacters.forEach((char) => {
    if (!uniqueSuspicious.has(char.codePoint)) {
      uniqueSuspicious.set(char.codePoint, char)
    }
  })
  
  // Convert to array to work with it more easily
  const uniqueSuspiciousArray = Array.from(uniqueSuspicious.values())
  
  // Determine how many items to show based on expanded state
  const needsCollapse = uniqueSuspiciousArray.length > MAX_VISIBLE_ITEMS
  const displayItems = expanded || !needsCollapse 
    ? uniqueSuspiciousArray 
    : uniqueSuspiciousArray.slice(0, MAX_VISIBLE_ITEMS)
    
  if (suspiciousCharacters.length === 0) return null
  
  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-medium mb-2">Detected Suspicious Characters:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {displayItems.map((char, index) => (
          <div key={index} className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
            <div className="bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-2 py-1 rounded font-mono">
              U+{char.codePoint.toString(16).toUpperCase().padStart(4, "0")}
            </div>
            <div className="flex-1 text-sm">{char.description}</div>
            <div className="text-sm text-muted-foreground">
              {suspiciousCharacters.filter((c) => c.codePoint === char.codePoint).length}×
            </div>
          </div>
        ))}
      </div>
      
      {!expanded && needsCollapse && (
        <div className="text-muted-foreground text-xs mt-2 text-center">
          ... {uniqueSuspiciousArray.length - MAX_VISIBLE_ITEMS} more suspicious characters
        </div>
      )}
      
      {needsCollapse && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2 h-6 text-xs w-full flex items-center justify-center" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              Show More
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export function UnicodeStats({ analysis }: UnicodeStatsProps) {
  if (!analysis) return null

  const { totalCharacters, visibleCharacters, invisibleCharacters, suspiciousCharacters, categories } = analysis

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-2xl font-bold">{totalCharacters}</div>
          <div className="text-sm text-muted-foreground">Total Characters</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-2xl font-bold">{visibleCharacters}</div>
          <div className="text-sm text-muted-foreground">Visible Characters</div>
        </div>
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="text-2xl font-bold">{invisibleCharacters}</div>
          <div className="text-sm text-muted-foreground">Invisible Characters</div>
        </div>
        <div
          className={`${suspiciousCharacters.length > 0 ? "bg-red-100 dark:bg-red-950/30" : "bg-green-100 dark:bg-green-950/30"} p-4 rounded-lg`}
        >
          <div
            className={`text-2xl font-bold ${suspiciousCharacters.length > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
          >
            {suspiciousCharacters.length}
          </div>
          <div
            className={`text-sm ${suspiciousCharacters.length > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}
          >
            Suspicious Characters
          </div>
        </div>
      </div>

      <SuspiciousCharactersPanel suspiciousCharacters={suspiciousCharacters} />
    </div>
  )
}

