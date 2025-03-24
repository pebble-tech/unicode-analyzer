"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface UnicodeDecoderProps {
  decodingResult: {
    extracted: string
    decodings: Array<{
      method: string
      result: string
      confidence: number
    }>
  } | null
}

export function UnicodeDecoder({ decodingResult }: UnicodeDecoderProps) {
  console.log(decodingResult);
  if (!decodingResult || !decodingResult.decodings.length) {
    return (
      <div className="text-center p-4 bg-muted/30 rounded-md">
        <p className="text-muted-foreground">No hidden messages detected</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Decoded Hidden Content:</h3>
      
      <div className="grid grid-cols-1 gap-4">
        {decodingResult.decodings.map((decoding, index) => (
          <DecodingCard key={index} decoding={decoding} />
        ))}
      </div>
    </div>
  )
}

function DecodingCard({ decoding }: { decoding: { method: string; result: string; confidence: number } }) {
  const [expanded, setExpanded] = useState(false)
  const MAX_CHARS = 500
  
  // Check if result is long enough to need collapsing
  const needsCollapse = decoding.result.length > MAX_CHARS
  
  // Get the display text based on expanded state
  const displayText = expanded || !needsCollapse 
    ? decoding.result 
    : decoding.result.substring(0, MAX_CHARS) + '...'
  
  return (
    <Card className={getConfidenceCardClass(decoding.confidence)}>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{decoding.method}</CardTitle>
          <ConfidenceBadge confidence={decoding.confidence} />
        </div>
      </CardHeader>
      <CardContent className="py-2">
        <div className="font-mono text-sm bg-background/50 p-2 rounded border whitespace-pre-wrap break-all">
          {displayText || <span className="text-muted-foreground italic">Empty result</span>}
          
          {!expanded && needsCollapse && (
            <div className="text-muted-foreground text-xs mt-1">
              ... {decoding.result.length - MAX_CHARS} more characters
            </div>
          )}
        </div>
        
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
      </CardContent>
    </Card>
  )
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence >= 0.8) {
    return <Badge variant="default">High Confidence</Badge>
  } else if (confidence >= 0.5) {
    return <Badge variant="secondary">Medium Confidence</Badge>
  } else {
    return <Badge variant="outline">Low Confidence</Badge>
  }
}

function getConfidenceCardClass(confidence: number): string {
  if (confidence >= 0.8) {
    return "border-green-200 dark:border-green-800"
  } else if (confidence >= 0.5) {
    return "border-yellow-200 dark:border-yellow-800"
  } else {
    return "border-muted"
  }
} 