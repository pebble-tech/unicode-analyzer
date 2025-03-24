"use client"

import { useMemo } from "react"

interface UnicodeHighlighterProps {
  text: string
  analysis: {
    suspiciousCharacters: Array<{
      char: string
      codePoint: number
      index: number
      description: string
    }>
  }
}

export function UnicodeHighlighter({ text, analysis }: UnicodeHighlighterProps) {
  if (!text || !analysis) return null

  // Create a map of suspicious character indices
  const suspiciousMap = new Map()
  analysis.suspiciousCharacters.forEach((char) => {
    suspiciousMap.set(char.index, char)
  })

  // Prepare segments with run-length encoding for repeated characters
  const segments = useMemo(() => {
    const result = []
    let lastIndex = 0
    let i = 0

    while (i < text.length) {
      if (suspiciousMap.has(i)) {
        // Add the safe text before this character
        if (i > lastIndex) {
          result.push({
            text: text.substring(lastIndex, i),
            isSuspicious: false,
          })
        }

        // Get the suspicious character info
        const charInfo = suspiciousMap.get(i)
        
        // Check if we have consecutive identical suspicious characters
        let count = 1
        let nextIndex = i + 1
        
        while (
          nextIndex < text.length && 
          suspiciousMap.has(nextIndex) && 
          suspiciousMap.get(nextIndex).codePoint === charInfo.codePoint
        ) {
          count++
          nextIndex++
        }
        
        // Add the suspicious character(s) - either single or with count
        if (count > 5) {
          result.push({
            text: charInfo.char,
            count: count,
            isSuspicious: true,
            codePoint: charInfo.codePoint,
            description: charInfo.description,
          })
          i = nextIndex - 1 // Will be incremented in the loop
        } else {
          result.push({
            text: text[i],
            isSuspicious: true,
            codePoint: charInfo.codePoint,
            description: charInfo.description,
          })
        }

        lastIndex = i + 1
      }
      i++
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      result.push({
        text: text.substring(lastIndex),
        isSuspicious: false,
      })
    }

    return result
  }, [text, suspiciousMap])

  return (
    <div className="font-mono text-sm whitespace-pre-wrap break-all overflow-hidden">
      {segments.map((segment, index) =>
        segment.isSuspicious ? (
          <span
            key={index}
            className="bg-red-500/20 text-red-600 dark:text-red-400 px-0.5 rounded border border-red-500/30 relative group cursor-help inline-flex items-center flex-wrap"
            title={`U+${segment.codePoint.toString(16).toUpperCase().padStart(4, "0")}: ${segment.description}`}
          >
            {segment.text || "␀"}
            {segment.count && <span className="ml-1 text-xs">×{segment.count}</span>}
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs rounded px-2 py-1 hidden group-hover:block whitespace-nowrap z-10">
              U+{segment.codePoint.toString(16).toUpperCase().padStart(4, "0")}: {segment.description}
            </span>
          </span>
        ) : (
          <span key={index} className="break-all whitespace-pre-wrap">{segment.text}</span>
        ),
      )}
    </div>
  )
}

