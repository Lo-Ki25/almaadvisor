import type { NextRequest } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  path: string
}

export class FileUploadHandler {
  private static uploadDir = process.env.UPLOAD_DIR || "/tmp/uploads"
  private static maxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE || "52428800") // 50MB

  static async handleUpload(request: NextRequest, projectId: string): Promise<UploadedFile[]> {
    try {
      const formData = await request.formData()
      const files = formData.getAll("files") as File[]

      if (!files || files.length === 0) {
        throw new Error("No files provided")
      }

      // Ensure upload directory exists
      const projectDir = path.join(this.uploadDir, projectId)
      await mkdir(projectDir, { recursive: true })

      const uploadedFiles: UploadedFile[] = []

      for (const file of files) {
        // Validate file size
        if (file.size === 0) {
          throw new Error(`File ${file.name} is empty`)
        }

        if (file.size > this.maxFileSize) {
          throw new Error(`File ${file.name} exceeds maximum size of ${Math.round(this.maxFileSize / 1024 / 1024)}MB`)
        }

        // Validate file type
        if (!this.isAllowedFileType(file.type, file.name)) {
          throw new Error(`File type ${file.type || 'unknown'} is not supported. Allowed: PDF, DOCX, XLSX, CSV, TXT, MD, ZIP`)
        }

        const fileId = randomUUID()
        const extension = path.extname(file.name)
        const fileName = `${fileId}${extension}`
        const filePath = path.join(projectDir, fileName)

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Write file to disk
        await writeFile(filePath, buffer)

        console.log(`File uploaded successfully: ${file.name} (${file.size} bytes) -> ${filePath}`)

        uploadedFiles.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type || this.getMimeTypeFromExtension(extension),
          path: filePath,
        })
      }

      return uploadedFiles
    } catch (error) {
      console.error("FileUploadHandler error:", error)
      throw error
    }
  }

  private static isAllowedFileType(mimeType: string, fileName: string): boolean {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "text/plain",
      "text/markdown",
      "application/zip",
    ]

    // Check by MIME type first
    if (mimeType && allowedTypes.includes(mimeType)) {
      return true
    }

    // Fallback: check by file extension
    const extension = path.extname(fileName).toLowerCase()
    const allowedExtensions = [".pdf", ".docx", ".xlsx", ".xls", ".csv", ".txt", ".md", ".zip"]
    
    return allowedExtensions.includes(extension)
  }

  private static getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".xls": "application/vnd.ms-excel",
      ".csv": "text/csv",
      ".txt": "text/plain",
      ".md": "text/markdown",
      ".zip": "application/zip",
    }

    return mimeTypes[extension.toLowerCase()] || "application/octet-stream"
  }

  static getFileExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      "application/pdf": ".pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
      "application/vnd.ms-excel": ".xls",
      "text/csv": ".csv",
      "text/plain": ".txt",
      "text/markdown": ".md",
      "application/zip": ".zip",
    }

    return extensions[mimeType] || ""
  }
}
