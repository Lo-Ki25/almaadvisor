import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { db } from '@/lib/db'

// Utiliser /tmp en production (Vercel) et le répertoire local en développement
const isProduction = process.env.NODE_ENV === 'production'
const PROJECTS_DIR = isProduction ? '/tmp/data/projects' : path.join(process.cwd(), 'data', 'projects')

interface Chunk {
  id: string
  documentId: string
  documentName: string
  content: string
  index: number
  metadata: any
}

interface Embedding {
  chunkId: string
  embedding: number[]
  metadata: any
  createdAt: string
}

// Lire les chunks d'un projet depuis la base de données
async function loadChunks(projectId: string): Promise<Chunk[]> {
  try {
    console.log(`Loading chunks for embedding from database: ${projectId}`)
    const chunks = await db.chunk.findMany({
      where: { projectId },
      include: {
        document: {
          select: {
            name: true
          }
        }
      }
    })
    
    console.log(`Found ${chunks.length} chunks from database for embedding`)
    
    // Convertir au format attendu
    const convertedChunks: Chunk[] = chunks.map((chunk, index) => ({
      id: chunk.id,
      documentId: chunk.docId,
      documentName: chunk.document.name,
      content: chunk.text,
      index,
      metadata: chunk.metadata ? JSON.parse(chunk.metadata) : {}
    }))
    
    return convertedChunks
  } catch (error) {
    console.error(`Error loading chunks for embedding project ${projectId}:`, error)
    return []
  }
}

// Lire les embeddings existants
async function loadEmbeddings(projectId: string): Promise<Embedding[]> {
  try {
    const projectPath = path.join(PROJECTS_DIR, projectId)
    const embeddingsFile = path.join(projectPath, 'embeddings.json')
    const data = await fs.readFile(embeddingsFile, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Sauvegarder les embeddings dans les fichiers et en base de données
async function saveEmbeddings(projectId: string, embeddings: Embedding[]): Promise<void> {
  try {
    // Sauvegarder dans les fichiers pour compatibilité
    const projectPath = path.join(PROJECTS_DIR, projectId)
    await fs.mkdir(projectPath, { recursive: true })
    const embeddingsFile = path.join(projectPath, 'embeddings.json')
    await fs.writeFile(embeddingsFile, JSON.stringify(embeddings, null, 2))
    
    // Sauvegarder les embeddings en base de données
    await saveEmbeddingsToDatabase(projectId, embeddings)
    
    console.log(`Embeddings sauvegardés: ${embeddings.length} embeddings pour le projet ${projectId}`)
  } catch (error) {
    console.error(`Erreur sauvegarde embeddings pour projet ${projectId}:`, error)
    throw error
  }
}

// Sauvegarder les embeddings en base de données Prisma
async function saveEmbeddingsToDatabase(projectId: string, embeddings: Embedding[]): Promise<void> {
  try {
    console.log(`Sauvegarde embeddings en base: ${embeddings.length} embeddings pour projet ${projectId}`)
    
    // Mettre à jour les chunks avec leurs embeddings
    for (const embedding of embeddings) {
      try {
        // Convertir l'embedding en buffer pour stockage efficace
        const embeddingBuffer = Buffer.from(new Float32Array(embedding.embedding).buffer)
        
        await db.chunk.update({
          where: { id: embedding.chunkId },
          data: {
            embedding: embeddingBuffer
          }
        })
        
      } catch (chunkError) {
        console.error(`Erreur sauvegarde embedding pour chunk ${embedding.chunkId}:`, chunkError)
        // Continuer avec les autres embeddings même si l'un échoue
      }
    }
    
    console.log(`Embeddings sauvegardés en base avec succès pour projet ${projectId}`)
  } catch (error) {
    console.error(`Erreur sauvegarde embeddings en base pour projet ${projectId}:`, error)
    throw error
  }
}

// Simuler la génération d'embeddings (dans un vrai projet, utiliser OpenAI API)
function generateMockEmbedding(text: string): number[] {
  // Générer un vecteur d'embedding simulé basé sur le texte
  const vectorSize = 1536 // Taille standard d'OpenAI ada-002
  const embedding: number[] = []
  
  // Utiliser le hash du texte comme seed pour générer des valeurs reproductibles
  let seed = 0
  for (let i = 0; i < text.length; i++) {
    seed += text.charCodeAt(i)
  }
  
  // Générateur de nombres pseudo-aléatoires simple
  function pseudoRandom(seed: number, index: number): number {
    const x = Math.sin(seed + index) * 10000
    return (x - Math.floor(x)) * 2 - 1 // Valeur entre -1 et 1
  }
  
  for (let i = 0; i < vectorSize; i++) {
    embedding.push(pseudoRandom(seed, i))
  }
  
  // Normaliser le vecteur
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

// POST - Générer les embeddings pour un projet
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Parameter "project" is required' },
        { status: 400 }
      )
    }

    console.log(`Début de la génération d'embeddings pour le projet: ${projectId}`)

    // Charger les chunks et embeddings existants
    const chunks = await loadChunks(projectId)
    const existingEmbeddings = await loadEmbeddings(projectId)
    
    if (chunks.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucun chunk trouvé pour ce projet',
          projectId,
          message: 'Veuillez d\'abord ingérer les documents avec POST /api/ingest'
        },
        { status: 404 }
      )
    }

    console.log(`${chunks.length} chunks trouvés`)

    // Identifier les chunks qui n'ont pas encore d'embedding
    const existingChunkIds = new Set(existingEmbeddings.map(e => e.chunkId))
    const chunksToEmbed = chunks.filter(chunk => !existingChunkIds.has(chunk.id))
    
    if (chunksToEmbed.length === 0) {
      return NextResponse.json({
        message: 'Tous les chunks ont déjà des embeddings',
        projectId,
        totalChunks: chunks.length,
        totalEmbeddings: existingEmbeddings.length
      })
    }

    console.log(`${chunksToEmbed.length} chunks à traiter pour les embeddings`)

    const newEmbeddings: Embedding[] = [...existingEmbeddings]
    let processedCount = 0
    let errorCount = 0

    // Générer les embeddings pour chaque chunk
    for (const chunk of chunksToEmbed) {
      try {
        console.log(`Génération embedding pour chunk: ${chunk.id}`)
        
        // Simuler un délai de traitement
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Générer l'embedding (simulation)
        const embedding = generateMockEmbedding(chunk.content)
        
        const embeddingObj: Embedding = {
          chunkId: chunk.id,
          embedding,
          metadata: {
            documentName: chunk.documentName,
            chunkIndex: chunk.index,
            contentLength: chunk.content.length,
            embeddingModel: 'mock-ada-002',
            vectorSize: embedding.length
          },
          createdAt: new Date().toISOString()
        }

        newEmbeddings.push(embeddingObj)
        processedCount++
        
        console.log(`Embedding généré pour chunk ${chunk.id}: ${embedding.length} dimensions`)
        
      } catch (error) {
        console.error(`Erreur lors de la génération d'embedding pour ${chunk.id}:`, error)
        errorCount++
      }
    }

    // Sauvegarder les embeddings
    await saveEmbeddings(projectId, newEmbeddings)

    const response = {
      message: 'Génération d\'embeddings terminée',
      projectId,
      results: {
        processedChunks: processedCount,
        errorChunks: errorCount,
        totalEmbeddings: newEmbeddings.length,
        newEmbeddings: processedCount
      },
      nextStep: processedCount > 0 ? 'Lancez la génération de rapport avec POST /api/generate' : null
    }

    console.log('Embeddings terminés:', response.results)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Erreur lors de la génération d\'embeddings:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération d\'embeddings',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - État des embeddings
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

    const chunks = await loadChunks(projectId)
    const embeddings = await loadEmbeddings(projectId)
    
    const embeddedChunkIds = new Set(embeddings.map(e => e.chunkId))
    
    const status = {
      projectId,
      totalChunks: chunks.length,
      embeddedChunks: embeddings.length,
      pendingChunks: chunks.length - embeddings.length,
      canEmbed: chunks.length > embeddings.length,
      vectorSize: embeddings.length > 0 ? embeddings[0].embedding.length : 0,
      chunks: chunks.map(chunk => ({
        id: chunk.id,
        documentName: chunk.documentName,
        hasEmbedding: embeddedChunkIds.has(chunk.id),
        contentLength: chunk.content.length
      }))
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Erreur lors de la récupération du statut des embeddings:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du statut des embeddings' },
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600',
    },
  })
}
