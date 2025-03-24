"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUploader } from "./file-uploader"
import { UnicodeHighlighter } from "./unicode-highlighter"
import { UnicodeStats } from "./unicode-stats"
import { UnicodeDecoder } from "./unicode-decoder"
import { analyzeText, cleanText, decodeHiddenText } from "@/lib/unicode-utils"

export default function UnicodeAnalyzer() {
  const [originalText, setOriginalText] = useState<string>("")
  const [cleanedText, setCleanedText] = useState<string>("")
  const [analysis, setAnalysis] = useState<any>(null)
  const [decodingResult, setDecodingResult] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>("input")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setOriginalText(text)
    const result = analyzeText(text)
    setAnalysis(result)
    setCleanedText(cleanText(text))
    
    // Also update the decoding result
    const decoded = decodeHiddenText(text)
    setDecodingResult(decoded)
  }

  const handleFileContent = (content: string) => {
    setOriginalText(content)
    const result = analyzeText(content)
    setAnalysis(result)
    setCleanedText(cleanText(content))
    
    // Also update the decoding result
    const decoded = decodeHiddenText(content)
    setDecodingResult(decoded)
    
    if (textareaRef.current) {
      textareaRef.current.value = content
    }
  }

  const handleCleanText = () => {
    const cleaned = cleanText(originalText)
    setCleanedText(cleaned)
    setActiveTab("cleaned")
  }

  const handleCopyClean = () => {
    navigator.clipboard.writeText(cleanedText)
  }

  return (
    <div className="space-y-6">
      <FileUploader onFileContent={handleFileContent} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Input Text</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="cleaned">Cleaned Text</TabsTrigger>
        </TabsList>

        <TabsContent value="input" className="space-y-4">
          <Textarea
            ref={textareaRef}
            placeholder="Paste your AI prompt text here or upload a file..."
            className="min-h-[300px] font-mono"
            onChange={handleTextChange}
          />

          {analysis && analysis.suspiciousCharacters.length > 0 && (
            <Alert variant={analysis.suspiciousCharacters.length > 10 ? "destructive" : "warning"}>
              <AlertDescription>
                {analysis.suspiciousCharacters.length > 10
                  ? `Warning: ${analysis.suspiciousCharacters.length} potentially malicious Unicode characters detected!`
                  : `Found ${analysis.suspiciousCharacters.length} unusual Unicode characters. Review them in the Analysis tab.`}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setActiveTab("analysis")}>Analyze Text</Button>
            <Button onClick={handleCleanText} variant="default">
              Clean Text
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {analysis ? (
            <div className="space-y-6">
              <UnicodeStats analysis={analysis} />
              
              <div className="border rounded-md p-4 bg-muted/30">
                <h3 className="text-lg font-medium mb-2">Text with Highlighted Characters:</h3>
                <UnicodeHighlighter text={originalText} analysis={analysis} />
              </div>
              
              {decodingResult && decodingResult.decodings.length > 0 && (
                <div className="border rounded-md p-4 bg-muted/30">
                  <UnicodeDecoder decodingResult={decodingResult} />
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={handleCleanText} variant="default">
                  Remove Hidden Characters
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p>Enter some text to analyze</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="cleaned" className="space-y-4">
          <Textarea value={cleanedText} className="min-h-[300px] font-mono" readOnly />

          {analysis && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {analysis.suspiciousCharacters.length} suspicious characters removed
              </p>
              <Button onClick={handleCopyClean} variant="outline">
                Copy Cleaned Text
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

