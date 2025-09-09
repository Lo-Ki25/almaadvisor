import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
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
  uploadedAt: string
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

// Sauvegarder les documents d'un projet dans les fichiers et en base
async function saveDocuments(projectId: string, documents: Document[]): Promise<void> {
  try {
    // Sauvegarder dans les fichiers pour compatibilité
    const projectPath = path.join(PROJECTS_DIR, projectId)
    await fs.mkdir(projectPath, { recursive: true })
    const documentsFile = path.join(projectPath, 'documents.json')
    await fs.writeFile(documentsFile, JSON.stringify(documents, null, 2))
    
    // Aussi sauvegarder en base de données Prisma
    await saveDocumentsToDatabase(projectId, documents)
    
    console.log(`Documents sauvegardés: ${documents.length} documents pour le projet ${projectId}`)
  } catch (error) {
    console.error(`Erreur sauvegarde documents pour projet ${projectId}:`, error)
    throw error
  }
}

// Sauvegarder les documents en base de données Prisma
async function saveDocumentsToDatabase(projectId: string, documents: Document[]): Promise<void> {
  try {
    console.log(`Sauvegarde en base: ${documents.length} documents pour projet ${projectId}`)
    
    // Insérer ou mettre à jour chaque document
    for (const doc of documents) {
      try {
        // Essayer de créer ou mettre à jour le document
        await db.document.upsert({
          where: { id: doc.id },
          create: {
            id: doc.id,
            projectId,
            name: doc.name,
            path: doc.path,
            size: doc.size,
            mime: doc.type,
            status: doc.status
          },
          update: {
            name: doc.name,
            path: doc.path,
            size: doc.size,
            mime: doc.type,
            status: doc.status
          }
        })
        
        console.log(`Document sauvegardé en base: ${doc.id} - ${doc.name}`)
        
      } catch (docError) {
        console.error(`Erreur sauvegarde document ${doc.id}:`, docError)
        // Continuer avec les autres documents même si l'un échoue
      }
    }
    
    console.log(`Documents sauvegardés en base avec succès pour projet ${projectId}`)
  } catch (error) {
    console.error(`Erreur sauvegarde documents en base pour projet ${projectId}:`, error)
    throw error
  }
}

// Sauvegarder les métadonnées du projet
async function saveProjectData(projectId: string, projectData: any): Promise<void> {
  const projectPath = path.join(PROJECTS_DIR, projectId)
  await fs.mkdir(projectPath, { recursive: true })
  const projectFile = path.join(projectPath, 'project.json')
  await fs.writeFile(projectFile, JSON.stringify(projectData, null, 2))
}

// Vérifier le type de fichier autorisé
function isAllowedFileType(mimeType: string, fileName: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  const allowedExtensions = ['.txt', '.pdf', '.csv', '.json', '.doc', '.docx', '.xls', '.xlsx', '.md']
  
  const fileExtension = path.extname(fileName.toLowerCase())
  
  return allowedTypes.includes(mimeType) || allowedExtensions.includes(fileExtension)
}

// POST - Upload de fichiers
export async function POST(request: NextRequest) {
  try {
    await ensureDirectories()
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    const projectTitle = searchParams.get('title') || projectId
    const clientName = searchParams.get('client') || 'Client'
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Parameter "project" is required' },
        { status: 400 }
      )
    }

    console.log(`Upload pour le projet: ${projectId}`)

    // Récupérer les données du formulaire avec gestion d'erreur robuste
    let formData: FormData
    let files: File[]
    
    try {
      formData = await request.formData()
      files = formData.getAll('files') as File[]
      
      // Vérifier aussi 'file' au singulier
      if (files.length === 0) {
        const singleFile = formData.get('file') as File
        if (singleFile) {
          files = [singleFile]
        }
      }
      
      console.log(`FormData reçu avec ${files.length} fichier(s)`)
      
      // Log des clés du FormData pour débug
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`FormData key: ${key}, file: ${value.name}, size: ${value.size}`)
        } else {
          console.log(`FormData key: ${key}, value: ${value}`)
        }
      }
      
    } catch (error) {
      console.error('Erreur lors du parsing FormData:', error)
      return NextResponse.json(
        { 
          error: 'Impossible de lire les données du formulaire',
          details: error.message
        },
        { status: 400 }
      )
    }
    
    if (files.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun fichier fourni',
          debug: 'Aucun fichier détecté dans le FormData. Vérifiez que les fichiers sont envoyés avec les clés "files" ou "file".'
        },
        { status: 400 }
      )
    }

    console.log(`${files.length} fichier(s) à traiter`)

    // Charger les documents existants
    const existingDocuments = await loadDocuments(projectId)
    const newDocuments: Document[] = []
    const results: any[] = []

    // Traiter chaque fichier
    for (const file of files) {
      try {
        console.log(`Traitement du fichier: ${file.name}`)
        
        // Vérifier le type de fichier
        if (!isAllowedFileType(file.type, file.name)) {
          console.warn(`Type de fichier non autorisé: ${file.name} (${file.type})`)
          results.push({
            name: file.name,
            status: 'error',
            error: `Type de fichier non autorisé: ${file.type}`
          })
          continue
        }
        
        // Vérifier la taille du fichier (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          console.warn(`Fichier trop volumineux: ${file.name} (${file.size} bytes)`)
          results.push({
            name: file.name,
            status: 'error',
            error: 'Fichier trop volumineux (max 50MB)'
          })
          continue
        }
        
        // Vérifier si le fichier existe déjà
        const existingDoc = existingDocuments.find(doc => doc.name === file.name)
        if (existingDoc) {
          console.warn(`Fichier déjà uploadé: ${file.name}`)
          results.push({
            name: file.name,
            status: 'duplicate',
            message: 'Fichier déjà uploadé',
            documentId: existingDoc.id
          })
          continue
        }
        
        // Créer le nom de fichier unique
        const fileId = uuidv4()
        const fileExtension = path.extname(file.name)
        const uniqueFileName = `${projectId}_${fileId}${fileExtension}`
        const filePath = path.join(UPLOADS_DIR, uniqueFileName)
        
        // Sauvegarder le fichier avec gestion d'erreur robuste
        let buffer: Buffer
        try {
          const arrayBuffer = await file.arrayBuffer()
          buffer = Buffer.from(arrayBuffer)
          console.log(`Buffer créé pour ${file.name}: ${buffer.length} bytes`)
        } catch (error) {
          console.error(`Erreur lors de la création du buffer pour ${file.name}:`, error)
          results.push({
            name: file.name,
            status: 'error',
            error: `Impossible de lire le fichier: ${error.message}`
          })
          continue
        }
        
        // Vérifier que le dossier existe
        try {
          await fs.mkdir(path.dirname(filePath), { recursive: true })
        } catch (error) {
          console.error(`Erreur lors de la création du dossier:`, error)
        }
        
        // Écrire le fichier
        try {
          await fs.writeFile(filePath, buffer)
          console.log(`Fichier sauvegardé: ${filePath} (${buffer.length} bytes)`)
          
          // Vérifier que le fichier a bien été écrit
          const stats = await fs.stat(filePath)
          console.log(`Vérification: fichier créé avec ${stats.size} bytes`)
          
        } catch (error) {
          console.error(`Erreur lors de l'écriture du fichier ${filePath}:`, error)
          results.push({
            name: file.name,
            status: 'error',
            error: `Impossible d'écrire le fichier: ${error.message}`
          })
          continue
        }
        
        // Créer l'objet document avec validation
        let document: Document
        try {
          document = {
            id: fileId,
            name: file.name,
            path: filePath,
            size: buffer.length, // Utiliser la taille réelle du buffer
            type: file.type || 'application/octet-stream',
            status: 'pending',
            uploadedAt: new Date().toISOString()
          }
          console.log(`Document préparé: ${document.id} (${document.size} bytes)`)
        } catch (error) {
          console.error(`Erreur lors de la création du document pour ${file.name}:`, error)
          results.push({
            name: file.name,
            status: 'error',
            error: `Impossible de créer le document: ${error.message}`
          })
          continue
        }
        
        newDocuments.push(document)
        results.push({
          name: file.name,
          status: 'uploaded',
          documentId: document.id,
          size: file.size,
          type: file.type
        })
        
        console.log(`Document créé avec succès: ${document.id}`)
        
      } catch (error) {
        console.error(`Erreur lors du traitement de ${file.name}:`, error)
        results.push({
          name: file.name,
          status: 'error',
          error: error.message
        })
      }
    }
    
    // Sauvegarder les nouveaux documents
    if (newDocuments.length > 0) {
      const allDocuments = [...existingDocuments, ...newDocuments]
      await saveDocuments(projectId, allDocuments)
      
      // Sauvegarder les métadonnées du projet
      const projectData = {
        id: projectId,
        title: projectTitle,
        client: clientName,
        createdAt: existingDocuments.length === 0 ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
        documentsCount: allDocuments.length
      }
      await saveProjectData(projectId, projectData)
      
      console.log(`Projet mis à jour: ${allDocuments.length} documents au total`)
    }

    const response = {
      message: `Upload terminé: ${newDocuments.length} fichier(s) ajouté(s)`,
      projectId,
      results: {
        uploaded: results.filter(r => r.status === 'uploaded').length,
        duplicates: results.filter(r => r.status === 'duplicate').length,
        errors: results.filter(r => r.status === 'error').length,
        totalFiles: files.length
      },
      files: results,
      nextStep: newDocuments.length > 0 ? 'Lancez l\'ingestion avec POST /api/ingest' : null
    }

    console.log('Upload terminé:', response.results)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'upload des fichiers',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - État des uploads d'un projet
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
    
    const status = {
      projectId,
      totalDocuments: documents.length,
      pendingDocuments: documents.filter(d => d.status === 'pending').length,
      processedDocuments: documents.filter(d => d.status === 'processed').length,
      errorDocuments: documents.filter(d => d.status === 'error').length,
      totalSize: documents.reduce((sum, doc) => sum + doc.size, 0),
      documents: documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        size: doc.size,
        type: doc.type,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        error: doc.error
      }))
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut des uploads' },
      { status: 500 }
    )
  }
}

// DELETE - Supprimer un document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    const documentId = searchParams.get('document')
    
    if (!projectId || !documentId) {
      return NextResponse.json(
        { error: 'Parameters "project" and "document" are required' },
        { status: 400 }
      )
    }

    const documents = await loadDocuments(projectId)
    const documentIndex = documents.findIndex(doc => doc.id === documentId)
    
    if (documentIndex === -1) {
      return NextResponse.json(
        { error: 'Document non trouvé' },
        { status: 404 }
      )
    }

    const document = documents[documentIndex]
    
    // Supprimer le fichier physique
    try {
      await fs.unlink(document.path)
      console.log(`Fichier supprimé: ${document.path}`)
    } catch (error) {
      console.warn(`Impossible de supprimer le fichier physique: ${error.message}`)
    }
    
    // Retirer le document de la liste
    documents.splice(documentIndex, 1)
    await saveDocuments(projectId, documents)
    
    return NextResponse.json({
      message: 'Document supprimé avec succès',
      documentId,
      documentName: document.name
    })

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la suppression du document',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// OPTIONS - Support CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600',
    },
  })
}
