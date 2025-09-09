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
  private static uploadDir = process.env.UPLOAD_DIR || "./uploads"
  private static maxFileSize = Number.parseInt(process.env.MAX_FILE_SIZE || "50000000") // 50MB

  static async handleUpload(request: NextRequest, projectId: string): Promise<UploadedFile[]> {
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
      if (file.size > this.maxFileSize) {
        throw new Error(`File ${file.name} exceeds maximum size of ${this.maxFileSize} bytes`)
      }

      if (!this.isAllowedFileType(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`)
      }

      const fileId = randomUUID()
      const extension = path.extname(file.name)
      const fileName = `${fileId}${extension}`
      const filePath = path.join(projectDir, fileName)

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      await writeFile(filePath, buffer)

      uploadedFiles.push({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
      })
    }

    return uploadedFiles
  }

  private static isAllowedFileType(mimeType: string): boolean {
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

    return allowedTypes.includes(mimeType)
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
