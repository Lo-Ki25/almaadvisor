import { z } from "zod"

// Types pour les énumérations
export const LanguageEnum = z.enum(["fr", "en"], {
  errorMap: () => ({ message: "La langue doit être 'fr' ou 'en'" })
})

export const ProfileEnum = z.enum(["institutionnel", "technique", "mixte"], {
  errorMap: () => ({ message: "Le profil doit être 'institutionnel', 'technique' ou 'mixte'" })
})

export const StyleEnum = z.enum(["cabinet", "pedagogique", "mixte"], {
  errorMap: () => ({ message: "Le style doit être 'cabinet pur', 'pédagogique' ou 'mixte'" })
})

// Schéma pour l'étape 1 - Métadonnées
export const metadataSchema = z.object({
  title: z.string()
    .min(1, "Le titre est obligatoire")
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  
  client: z.string()
    .min(1, "Le nom du client est obligatoire")
    .min(2, "Le nom du client doit contenir au moins 2 caractères")
    .max(50, "Le nom du client ne peut pas dépasser 50 caractères"),
  
  consultant: z.string()
    .max(50, "Le nom du consultant ne peut pas dépasser 50 caractères")
    .optional()
    .or(z.literal("")),
  
  language: LanguageEnum,
  profile: ProfileEnum,
  style: StyleEnum,
})

// Schéma pour les fichiers uploadés
export const fileSchema = z.object({
  file: z.instanceof(File, { message: "Un fichier valide est requis" }),
  status: z.enum(["pending", "uploading", "success", "error"]),
  progress: z.number().min(0).max(100),
  id: z.string().optional(),
})

// Schéma pour l'étape 2 - Documents
export const documentsSchema = z.object({
  files: z.array(fileSchema).optional(),
  withoutSource: z.boolean().default(false),
}).refine(
  (data) => (data.files && data.files.length > 0) || data.withoutSource,
  {
    message: "Vous devez uploader au moins un fichier ou activer le mode 'sans source'",
    path: ["files"]
  }
)

// Liste des méthodologies disponibles
export const availableMethodologies = [
  "TOGAF", "Zachman", "C4 Model", "BPMN 2.0", "ITIL 4", "COBIT 2019",
  "OWASP", "ISO 27001", "RGPD", "Loi 09-08", "WCAG 2.2", "STRIDE",
  "SRE", "FinOps", "Balanced Scorecard", "Business Model Canvas",
  "Value Proposition Canvas", "RICE", "MoSCoW", "SWOT", "PESTEL", "FAIR"
] as const

// Schéma pour l'étape 3 - Méthodologies
export const methodologiesSchema = z.object({
  methodologies: z.array(z.enum(availableMethodologies))
    .min(1, "Vous devez sélectionner au moins une méthodologie")
    .max(10, "Vous ne pouvez pas sélectionner plus de 10 méthodologies"),
})

// Schéma pour les options RAG
export const ragOptionsSchema = z.object({
  chunkSize: z.number()
    .min(100, "La taille des chunks doit être d'au moins 100 caractères")
    .max(2000, "La taille des chunks ne peut pas dépasser 2000 caractères")
    .default(800),
  
  overlap: z.number()
    .min(0, "Le chevauchement ne peut pas être négatif")
    .max(500, "Le chevauchement ne peut pas dépasser 500 caractères")
    .default(120),
  
  topK: z.number()
    .min(1, "Le Top-K doit être d'au moins 1")
    .max(20, "Le Top-K ne peut pas dépasser 20")
    .default(8),
})

// Schéma pour l'étape 4 - Génération
export const generationSchema = z.object({
  ragOptions: ragOptionsSchema,
  estimatedCost: z.number().optional(),
  estimatedDuration: z.number().optional(),
})

// Schéma complet du wizard
export const wizardSchema = z.object({
  metadata: metadataSchema,
  documents: documentsSchema,
  methodologies: methodologiesSchema,
  generation: generationSchema,
})

// Types TypeScript inférés
export type MetadataFormData = z.infer<typeof metadataSchema>
export type DocumentsFormData = z.infer<typeof documentsSchema>
export type MethodologiesFormData = z.infer<typeof methodologiesSchema>
export type GenerationFormData = z.infer<typeof generationSchema>
export type WizardFormData = z.infer<typeof wizardSchema>
export type FileData = z.infer<typeof fileSchema>
export type RAGOptions = z.infer<typeof ragOptionsSchema>

// Types pour les étapes
export type WizardStep = 1 | 2 | 3 | 4
export type StepValidation = {
  isValid: boolean
  errors: string[]
}

// Fonction helper pour valider une étape spécifique
export function validateStep(step: WizardStep, data: any): StepValidation {
  try {
    switch (step) {
      case 1:
        metadataSchema.parse(data)
        break
      case 2:
        documentsSchema.parse(data)
        break
      case 3:
        methodologiesSchema.parse(data)
        break
      case 4:
        generationSchema.parse(data)
        break
      default:
        return { isValid: false, errors: ["Étape invalide"] }
    }
    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => err.message)
      }
    }
    return { isValid: false, errors: ["Erreur de validation inconnue"] }
  }
}

// Configuration des types de fichiers acceptés
export const acceptedFileTypes = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/csv": [".csv"],
  "text/markdown": [".md"],
  "text/plain": [".txt"],
  "application/zip": [".zip"],
} as const

export const maxFileSize = 50 * 1024 * 1024 // 50MB
export const maxTotalFiles = 20

// Helper pour valider un fichier
export function validateFile(file: File): { isValid: boolean; error?: string } {
  // Vérifier la taille
  if (file.size > maxFileSize) {
    return {
      isValid: false,
      error: `Le fichier ${file.name} est trop volumineux (max 50MB)`
    }
  }

  // Vérifier le type MIME
  const isValidType = Object.keys(acceptedFileTypes).includes(file.type) ||
    file.name.endsWith('.md') || file.name.endsWith('.txt')

  if (!isValidType) {
    return {
      isValid: false,
      error: `Type de fichier non supporté: ${file.type}`
    }
  }

  return { isValid: true }
}
