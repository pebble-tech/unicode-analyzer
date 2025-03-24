import { Suspense } from "react"
import UnicodeAnalyzer from "@/components/unicode-analyzer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Unicode Analyzer for AI Prompts</CardTitle>
          <CardDescription>
            Detect and remove hidden Unicode characters that could be used for prompt injection attacks in AI coding
            assistants like GitHub Copilot and Cursor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading...</div>}>
            <UnicodeAnalyzer />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  )
}

