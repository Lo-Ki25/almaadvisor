import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function initDatabase() {
  try {
    console.log("[v0] Starting database initialization...")

    // Test database connection
    await prisma.$connect()
    console.log("[v0] Database connected successfully")

    // Create sample data
    console.log("[v0] Creating sample project...")

    const sampleProject = await prisma.project.upsert({
      where: { id: "sample-project-1" },
      update: {},
      create: {
        id: "sample-project-1",
        name: "Projet de Transformation Digitale",
        description: "Analyse et recommandations pour la transformation digitale d'une entreprise",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    console.log("[v0] Sample project created:", sampleProject.name)

    // Create sample documents
    console.log("[v0] Creating sample documents...")

    const sampleDoc = await prisma.document.upsert({
      where: { id: "sample-doc-1" },
      update: {},
      create: {
        id: "sample-doc-1",
        projectId: sampleProject.id,
        filename: "analyse-existant.pdf",
        originalName: "Analyse de l'existant.pdf",
        mimeType: "application/pdf",
        size: 1024000,
        uploadedAt: new Date(),
      },
    })

    console.log("[v0] Sample document created:", sampleDoc.filename)

    // Create sample analysis
    console.log("[v0] Creating sample analysis...")

    const sampleAnalysis = await prisma.analysis.upsert({
      where: { id: "sample-analysis-1" },
      update: {},
      create: {
        id: "sample-analysis-1",
        projectId: sampleProject.id,
        type: "digital_maturity",
        results: {
          score: 65,
          recommendations: [
            "Améliorer la stratégie digitale",
            "Renforcer les compétences numériques",
            "Moderniser l'infrastructure IT",
          ],
          strengths: ["Équipe motivée", "Budget disponible"],
          weaknesses: ["Processus obsolètes", "Résistance au changement"],
        },
        createdAt: new Date(),
      },
    })

    console.log("[v0] Sample analysis created with score:", sampleAnalysis.results.score)

    console.log("[v0] Database initialization completed successfully!")
  } catch (error) {
    console.error("[v0] Database initialization failed:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the initialization
initDatabase()
  .then(() => {
    console.log("[v0] ✅ Database setup complete")
    process.exit(0)
  })
  .catch((error) => {
    console.error("[v0] ❌ Database setup failed:", error)
    process.exit(1)
  })
