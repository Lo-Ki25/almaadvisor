import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    const projectId = params.id
    
    // Utiliser /tmp en production (Vercel) et le répertoire local en développement
    const isProduction = process.env.NODE_ENV === 'production'
    const PROJECTS_DIR = isProduction ? '/tmp/data/projects' : path.join(process.cwd(), 'data', 'projects')
    const UPLOADS_DIR = isProduction ? '/tmp/uploads' : path.join(process.cwd(), 'uploads')
    
    const projectPath = path.join(PROJECTS_DIR, projectId)
    
    try {
      // Vérifier que le projet existe
      await fs.stat(projectPath)
    } catch {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }
    
    console.log(`Suppression du projet: ${projectId}`)
    
    try {
      // Supprimer les fichiers uploadés du projet
      const uploadedFiles = await fs.readdir(UPLOADS_DIR)
      const projectFiles = uploadedFiles.filter(file => file.startsWith(projectId))
      
      for (const file of projectFiles) {
        try {
          await fs.unlink(path.join(UPLOADS_DIR, file))
          console.log(`Fichier supprimé: ${file}`)
        } catch (err) {
          console.warn(`Impossible de supprimer ${file}:`, err.message)
        }
      }
    } catch {
      // Pas de fichiers à supprimer
    }
    
    // Supprimer le dossier du projet récursivement
    async function deleteRecursively(dirPath: string) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name)
          
          if (entry.isDirectory()) {
            await deleteRecursively(fullPath)
          } else {
            await fs.unlink(fullPath)
          }
        }
        
        await fs.rmdir(dirPath)
      } catch (error) {
        console.warn(`Erreur lors de la suppression de ${dirPath}:`, error.message)
      }
    }
    
    await deleteRecursively(projectPath)
    console.log(`Projet ${projectId} supprimé avec succès`)
    
    return NextResponse.json({ 
      message: "Projet supprimé avec succès",
      projectId 
    })
    
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}

// OPTIONS pour CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '3600',
    },
  })
}
