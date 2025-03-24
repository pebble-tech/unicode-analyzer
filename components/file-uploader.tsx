"use client"

import type React from "react"

import { useState } from "react"
import { Upload } from "lucide-react"

interface FileUploaderProps {
  onFileContent: (content: string) => void
}

export function FileUploader({ onFileContent }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      onFileContent(content)
    }
    reader.readAsText(file)
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/20"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div className="text-sm">
          <label htmlFor="file-upload" className="cursor-pointer text-primary hover:underline">
            Click to upload
          </label>{" "}
          or drag and drop
        </div>
        <p className="text-xs text-muted-foreground">TXT, MD or other plain text files</p>
        {fileName && <p className="text-sm font-medium mt-2">Uploaded: {fileName}</p>}
      </div>
      <input
        id="file-upload"
        type="file"
        accept=".txt,.md,.js,.py,.json,.html,.css,.ts,.tsx,.jsx"
        className="sr-only"
        onChange={handleFileChange}
      />
    </div>
  )
}

