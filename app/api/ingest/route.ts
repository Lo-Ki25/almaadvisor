import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'
import { db } from '@/lib/db'

// Utiliser /tmp en production (Vercel) et le répertoire local en développement
const isProduction = process.env.NODE_ENV === 'production'
const PROJECTS_DIR = isProduction ? '/tmp/data/projects' : path.join(process.cwd(), 'data', 'projects')
const UPLOADS_DIR = isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads')

interface Document {
  id: string
  name: string
  path: string
  size: number
  type: string
  status: 'pending' | 'processing' | 'processed' | 'error'
  error?: string
  chunks?: any[]
  extractedText?: string
  metadata?: any
  uploadedAt: string
  processedAt?: string
}

interface Chunk {
  id: string
  documentId: string
  documentName: string
  content: string
  index: number
  metadata: {
    page?: number
    section?: string
    [key: string]: any
  }
}

// Assurer que les dossiers existent
async function ensureDirectories() {
  try {
    await fs.access(PROJECTS_DIR)
  } catch {
    await fs.mkdir(PROJECTS_DIR, { recursive: true })
  }
  
  try {
    await fs.access(UPLOADS_DIR)
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
  }
}

// Lire les documents d'un projet
async function loadDocuments(projectId: string): Promise<Document[]> {
  try {
    const projectPath = path.join(PROJECTS_DIR, projectId)
    const documentsFile = path.join(projectPath, 'documents.json')
    const data = await fs.readFile(documentsFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Sauvegarder les documents d'un projet
async function saveDocuments(projectId: string, documents: Document[]): Promise<void> {
  const projectPath = path.join(PROJECTS_DIR, projectId)
  await fs.mkdir(projectPath, { recursive: true })
  const documentsFile = path.join(projectPath, 'documents.json')
  await fs.writeFile(documentsFile, JSON.stringify(documents, null, 2))
}

// Sauvegarder les chunks d'un projet dans les fichiers et en base
async function saveChunks(projectId: string, chunks: Chunk[]): Promise<void> {
  try {
    // Sauvegarder dans les fichiers pour compatibilité
    const projectPath = path.join(PROJECTS_DIR, projectId)
    await fs.mkdir(projectPath, { recursive: true })
    const chunksFile = path.join(projectPath, 'chunks.json')
    await fs.writeFile(chunksFile, JSON.stringify(chunks, null, 2))
    
    // Aussi sauvegarder en base de données Prisma
    await saveChunksToDatabase(projectId, chunks)
    
    console.log(`Chunks sauvegardés: ${chunks.length} chunks pour le projet ${projectId}`)
  } catch (error) {
    console.error(`Erreur sauvegarde chunks pour projet ${projectId}:`, error)
    throw error
  }
}

// Sauvegarder les chunks en base de données Prisma
async function saveChunksToDatabase(projectId: string, chunks: Chunk[]): Promise<void> {
  try {
    console.log(`Sauvegarde en base: ${chunks.length} chunks pour projet ${projectId}`)
    
    // Supprimer les chunks existants pour ce projet pour éviter les doublons
    await db.chunk.deleteMany({
      where: { projectId }
    })
    
    // Insérer les nouveaux chunks
    for (const chunk of chunks) {
      try {
        // Trouver le document correspondant
        const document = await db.document.findFirst({
          where: { 
            projectId,
            name: chunk.documentName
          }
        })
        
        if (!document) {
          console.warn(`Document non trouvé pour chunk ${chunk.id}: ${chunk.documentName}`)
          continue
        }
        
        await db.chunk.create({
          data: {
            id: chunk.id,
            projectId,
            docId: document.id,
            page: chunk.metadata?.page || chunk.index,
            text: chunk.content,
            metadata: JSON.stringify(chunk.metadata)
          }
        })
        
      } catch (chunkError) {
        console.error(`Erreur sauvegarde chunk ${chunk.id}:`, chunkError)
        // Continuer avec les autres chunks même si l'un échoue
      }
    }
    
    console.log(`Chunks sauvegardés en base avec succès pour projet ${projectId}`)
  } catch (error) {
    console.error(`Erreur sauvegarde chunks en base pour projet ${projectId}:`, error)
    throw error
  }
}

// Lire les chunks existants
async function loadChunks(projectId: string): Promise<Chunk[]> {
  try {
    const projectPath = path.join(PROJECTS_DIR, projectId)
    const chunksFile = path.join(projectPath, 'chunks.json')
    const data = await fs.readFile(chunksFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Extraire le texte selon le type de fichier
async function extractText(filePath: string, fileType: string): Promise<{ text: string; metadata: any }> {
  let text = ''
  let metadata = {}

  try {
    console.log(`Extraction de texte pour ${filePath} (type: ${fileType})`)
    
    switch (fileType.toLowerCase()) {
      case 'text/plain':
      case '.txt':
        text = await fs.readFile(filePath, 'utf-8')
        metadata = { type: 'text', lines: text.split('\n').length }
        break
        
      case 'application/pdf':
      case '.pdf':
        try {
          const pdfBuffer = await fs.readFile(filePath)
          const pdfData = await pdfParse(pdfBuffer)
          text = pdfData.text
          metadata = { 
            type: 'pdf',
            pages: pdfData.numpages,
            info: pdfData.info,
            version: pdfData.version
          }
          console.log(`PDF extrait: ${text.length} caractères, ${pdfData.numpages} pages`)
        } catch (pdfError) {
          console.warn(`Erreur extraction PDF ${filePath}:`, pdfError.message)
          text = `[Erreur d'extraction PDF: ${pdfError.message}]`
          metadata = { type: 'pdf', error: pdfError.message }
        }
        break
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case '.docx':
        try {
          const docBuffer = await fs.readFile(filePath)
          const result = await mammoth.extractRawText({ buffer: docBuffer })
          text = result.value
          metadata = { 
            type: 'docx',
            warnings: result.messages.length,
            hasImages: result.messages.some(m => m.message.includes('image'))
          }
          console.log(`DOCX extrait: ${text.length} caractères`)
          if (result.messages.length > 0) {
            console.log(`Avertissements DOCX:`, result.messages.map(m => m.message))
          }
        } catch (docError) {
          console.warn(`Erreur extraction DOCX ${filePath}:`, docError.message)
          text = `[Erreur d'extraction DOCX: ${docError.message}]`
          metadata = { type: 'docx', error: docError.message }
        }
        break
        
      case 'text/csv':
      case '.csv':
        const csvContent = await fs.readFile(filePath, 'utf-8')
        text = csvContent.replace(/,/g, ' ')
        metadata = { type: 'csv', rows: csvContent.split('\n').length }
        break
        
      case 'application/json':
      case '.json':
        const jsonContent = await fs.readFile(filePath, 'utf-8')
        const jsonData = JSON.parse(jsonContent)
        text = JSON.stringify(jsonData, null, 2)
        metadata = { type: 'json', keys: Object.keys(jsonData).length }
        break
        
      default:
        // Essayer de lire comme texte par défaut
        try {
          text = await fs.readFile(filePath, 'utf-8')
          metadata = { type: 'unknown', assumedText: true }
        } catch (encodingError) {
          console.warn(`Impossible de lire comme texte UTF-8: ${encodingError.message}`)
          text = `[Fichier non supporté: ${fileType}]`
          metadata = { type: 'unsupported', error: encodingError.message }
        }
        break
    }
  } catch (error) {
    console.error(`Erreur lors de l'extraction de texte pour ${filePath}:`, error)
    throw new Error(`Impossible d'extraire le texte: ${error.message}`)
  }

  // Vérifier que du texte a été extrait
  if (!text || text.trim().length === 0) {
    console.warn(`Aucun texte extrait pour ${filePath}`)
    text = `[Aucun contenu textuel trouvé dans ${path.basename(filePath)}]`
  }

  console.log(`Extraction terminée: ${text.length} caractères pour ${path.basename(filePath)}`)
  return { text: text.trim(), metadata }
}

// Découper le texte en chunks
function chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
  if (text.length <= maxChunkSize) {
    return [text]
  }

  const chunks: string[] = []
  let start = 0
  let iterations = 0
  const maxIterations = Math.ceil(text.length / (maxChunkSize - overlap)) + 100 // Limite de sécurité

  console.log(`Découpage de ${text.length} caractères en chunks de ${maxChunkSize} avec overlap ${overlap}`)

  while (start < text.length && iterations < maxIterations) {
    const end = Math.min(start + maxChunkSize, text.length)
    let chunk = text.slice(start, end)
    let actualEnd = end

    // Essayer de couper sur une phrase ou un mot
    if (end < text.length) {
      const lastSentence = chunk.lastIndexOf('. ')
      const lastWord = chunk.lastIndexOf(' ')
      
      if (lastSentence > maxChunkSize / 2) {
        chunk = chunk.slice(0, lastSentence + 2)
        actualEnd = start + lastSentence + 2
      } else if (lastWord > maxChunkSize / 2) {
        chunk = chunk.slice(0, lastWord)
        actualEnd = start + lastWord
      }
    }

    const trimmedChunk = chunk.trim()
    if (trimmedChunk.length > 0) {
      chunks.push(trimmedChunk)
    }
    
    // Avancer la position de départ
    const nextStart = Math.max(actualEnd - overlap, start + 1)
    if (nextStart <= start) {
      // Éviter la boucle infinie
      console.warn(`Boucle infinie détectée au caractère ${start}, forçage d'avancement`)
      start = start + Math.max(1, Math.floor(maxChunkSize / 2))
    } else {
      start = nextStart
    }
    
    iterations++
    
    if (iterations % 100 === 0) {
      console.log(`Chunk ${iterations}: position ${start}/${text.length}`)
    }
  }

  if (iterations >= maxIterations) {
    console.warn(`Limite d'itérations atteinte (${maxIterations}), arrêt du découpage`)
  }

  console.log(`Découpage terminé: ${chunks.length} chunks créés en ${iterations} itérations`)
  return chunks
}

// POST - Ingérer les documents d'un projet
export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Parameter "project" is required' },
        { status: 400 }
      )
    }

    console.log(`Début de l'ingestion pour le projet: ${projectId}`)

    // Charger les documents existants
    const documents = await loadDocuments(projectId)
    const existingChunks = await loadChunks(projectId)
    
    if (documents.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun document trouvé pour ce projet',
          projectId,
          message: 'Veuillez d\'abord uploader des documents'
        },
        { status: 404 }
      )
    }

    console.log(`${documents.length} documents trouvés`)

    // Traiter les documents non encore traités
    const documentsToProcess = documents.filter(doc => 
      doc.status === 'pending' || doc.status === 'error'
    )
    
    if (documentsToProcess.length === 0) {
      return NextResponse.json({
        message: 'Tous les documents sont déjà traités',
        projectId,
        totalDocuments: documents.length,
        processedDocuments: documents.filter(d => d.status === 'processed').length,
        totalChunks: existingChunks.length
      })
    }

    console.log(`${documentsToProcess.length} documents à traiter`)

    let processedCount = 0
    let errorCount = 0
    const newChunks: Chunk[] = [...existingChunks]

    // Traiter chaque document
    for (const doc of documentsToProcess) {
      try {
        console.log(`Traitement du document: ${doc.name}`)
        
        // Marquer comme en cours de traitement
        doc.status = 'processing'
        await saveDocuments(projectId, documents)

        // Extraire le texte
        const { text, metadata } = await extractText(doc.path, doc.type)
        
        if (!text || text.trim().length === 0) {
          throw new Error('Aucun texte extrait du document')
        }

        console.log(`Texte extrait: ${text.length} caractères`)

        // Découper en chunks
        const textChunks = chunkText(text)
        console.log(`${textChunks.length} chunks créés`)

        // Créer les objets chunks
        const docChunks = textChunks.map((chunk, index) => ({
          id: `${doc.id}-chunk-${index}`,
          documentId: doc.id,
          documentName: doc.name,
          content: chunk,
          index,
          metadata: {
            ...metadata,
            documentType: doc.type,
            chunkSize: chunk.length
          }
        }))

        // Ajouter les chunks à la liste
        newChunks.push(...docChunks)

        // Mettre à jour le document
        doc.status = 'processed'
        doc.processedAt = new Date().toISOString()
        doc.extractedText = text.substring(0, 500) + '...' // Preview
        doc.metadata = { ...metadata, chunksCount: docChunks.length }
        doc.chunks = docChunks.map(c => ({ id: c.id, size: c.content.length }))

        processedCount++
        console.log(`Document ${doc.name} traité avec succès`)
        
      } catch (error) {
        console.error(`Erreur lors du traitement de ${doc.name}:`, error)
        doc.status = 'error'
        doc.error = error.message
        doc.processedAt = new Date().toISOString()
        errorCount++
      }
    }

    // Sauvegarder les résultats
    await saveDocuments(projectId, documents)
    await saveChunks(projectId, newChunks)

    const response = {
      message: 'Ingestion terminée',
      projectId,
      results: {
        processedDocuments: processedCount,
        errorDocuments: errorCount,
        totalChunks: newChunks.length,
        newChunks: newChunks.length - existingChunks.length
      },
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        status: doc.status,
        chunksCount: doc.chunks?.length || 0,
        error: doc.error
      })),
      nextStep: processedCount > 0 ? 'Lancez l\'embedding avec POST /api/embed' : null
    }

    console.log('Ingestion terminée:', response.results)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de l\'ingestion:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'ingestion des documents',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - État de l'ingestion
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Parameter "project" is required' },
        { status: 400 }
      )
    }

    const documents = await loadDocuments(projectId)
    const chunks = await loadChunks(projectId)
    
    const status = {
      projectId,
      totalDocuments: documents.length,
      pendingDocuments: documents.filter(d => d.status === 'pending').length,
      processingDocuments: documents.filter(d => d.status === 'processing').length,
      processedDocuments: documents.filter(d => d.status === 'processed').length,
      errorDocuments: documents.filter(d => d.status === 'error').length,
      totalChunks: chunks.length,
      canIngest: documents.some(d => d.status === 'pending' || d.status === 'error'),
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        status: doc.status,
        chunksCount: doc.chunks?.length || 0,
        error: doc.error,
        processedAt: doc.processedAt
      }))
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut' },
      { status: 500 }
    )
  }
}

// OPTIONS - Support CORS pour préflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600',
    },
  })
}
