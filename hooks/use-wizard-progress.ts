import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  WizardStep, 
  MetadataFormData, 
  DocumentsFormData, 
  MethodologiesFormData, 
  GenerationFormData,
  FileData,
  validateStep,
  ragOptionsSchema
} from '@/lib/validations/wizard'

// Configuration des clés localStorage
const STORAGE_KEYS = {
  WIZARD_DATA: 'wizard-progress',
  CURRENT_STEP: 'wizard-current-step',
} as const

// Type pour l'état complet du wizard
export interface WizardState {
  currentStep: WizardStep
  metadata: MetadataFormData
  documents: DocumentsFormData
  methodologies: MethodologiesFormData
  generation: GenerationFormData
  uploadedFiles: FileData[]
  isProcessing: boolean
}

// État initial du wizard
const initialState: WizardState = {
  currentStep: 1,
  metadata: {
    title: '',
    client: '',
    consultant: '',
    language: 'fr',
    profile: 'institutionnel',
    style: 'cabinet',
  },
  documents: {
    files: [],
    withoutSource: false,
  },
  methodologies: {
    methodologies: [],
  },
  generation: {
    ragOptions: ragOptionsSchema.parse({
      chunkSize: 800,
      overlap: 120,
      topK: 8,
    }),
    estimatedCost: undefined,
    estimatedDuration: undefined,
  },
  uploadedFiles: [],
  isProcessing: false,
}

export function useWizardProgress() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<WizardState>(initialState)

  // Charger l'état depuis localStorage et URL au montage
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEYS.WIZARD_DATA)
    const savedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP)
    const urlStep = searchParams.get('step')

    let loadedState = { ...initialState }

    // Charger les données sauvegardées
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        loadedState = { ...loadedState, ...parsedData }
      } catch (error) {
        console.warn('Erreur lors du chargement des données du wizard:', error)
      }
    }

    // Déterminer l'étape actuelle (priorité: URL > localStorage > défaut)
    let currentStep: WizardStep = 1
    if (urlStep && ['1', '2', '3', '4'].includes(urlStep)) {
      currentStep = parseInt(urlStep) as WizardStep
    } else if (savedStep && ['1', '2', '3', '4'].includes(savedStep)) {
      currentStep = parseInt(savedStep) as WizardStep
    }

    loadedState.currentStep = currentStep
    setState(loadedState)
  }, [searchParams])

  // Sauvegarder l'état dans localStorage
  const saveToStorage = useCallback((newState: WizardState) => {
    try {
      const dataToSave = { ...newState }
      delete (dataToSave as any).isProcessing // Ne pas persister isProcessing
      
      localStorage.setItem(STORAGE_KEYS.WIZARD_DATA, JSON.stringify(dataToSave))
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, newState.currentStep.toString())
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde:', error)
    }
  }, [])

  // Mettre à jour l'URL
  const updateURL = useCallback((step: WizardStep) => {
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('step', step.toString())
    
    // Utiliser pushState pour ne pas déclencher de re-render
    window.history.pushState({}, '', currentUrl.toString())
  }, [])

  // Mettre à jour l'état global
  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState(prevState => {
      const newState = { ...prevState, ...updates }
      saveToStorage(newState)
      return newState
    })
  }, [saveToStorage])

  // Navigation entre les étapes
  const goToStep = useCallback((step: WizardStep) => {
    updateState({ currentStep: step })
    updateURL(step)
  }, [updateState, updateURL])

  const nextStep = useCallback(() => {
    if (state.currentStep < 4) {
      const newStep = (state.currentStep + 1) as WizardStep
      goToStep(newStep)
    }
  }, [state.currentStep, goToStep])

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      const newStep = (state.currentStep - 1) as WizardStep
      goToStep(newStep)
    }
  }, [state.currentStep, goToStep])

  // Validation des étapes
  const validateCurrentStep = useCallback(() => {
    let dataToValidate: any

    switch (state.currentStep) {
      case 1:
        dataToValidate = state.metadata
        break
      case 2:
        dataToValidate = {
          files: state.uploadedFiles,
          withoutSource: state.documents.withoutSource
        }
        break
      case 3:
        dataToValidate = state.methodologies
        break
      case 4:
        dataToValidate = state.generation
        break
      default:
        return { isValid: false, errors: ['Étape invalide'] }
    }

    return validateStep(state.currentStep, dataToValidate)
  }, [state])

  const canProceedToNextStep = useCallback(() => {
    const validation = validateCurrentStep()
    return validation.isValid
  }, [validateCurrentStep])

  // Mise à jour des données par section
  const updateMetadata = useCallback((data: Partial<MetadataFormData>) => {
    updateState({
      metadata: { ...state.metadata, ...data }
    })
  }, [state.metadata, updateState])

  const updateDocuments = useCallback((data: Partial<DocumentsFormData>) => {
    updateState({
      documents: { ...state.documents, ...data }
    })
  }, [state.documents, updateState])

  const updateMethodologies = useCallback((data: Partial<MethodologiesFormData>) => {
    updateState({
      methodologies: { ...state.methodologies, ...data }
    })
  }, [state.methodologies, updateState])

  const updateGeneration = useCallback((data: Partial<GenerationFormData>) => {
    updateState({
      generation: { ...state.generation, ...data }
    })
  }, [state.generation, updateState])

  // Gestion des fichiers uploadés
  const addFiles = useCallback((files: FileData[]) => {
    const newFiles = [...state.uploadedFiles, ...files]
    updateState({ uploadedFiles: newFiles })
    
    // Si des fichiers sont ajoutés, désactiver le mode sans source
    if (files.length > 0) {
      updateDocuments({ withoutSource: false })
    }
  }, [state.uploadedFiles, updateState, updateDocuments])

  const removeFile = useCallback((index: number) => {
    const newFiles = state.uploadedFiles.filter((_, i) => i !== index)
    updateState({ uploadedFiles: newFiles })
  }, [state.uploadedFiles, updateState])

  const updateFileStatus = useCallback((index: number, status: FileData['status'], progress?: number) => {
    const newFiles = [...state.uploadedFiles]
    if (newFiles[index]) {
      newFiles[index].status = status
      if (progress !== undefined) {
        newFiles[index].progress = progress
      }
    }
    updateState({ uploadedFiles: newFiles })
  }, [state.uploadedFiles, updateState])

  // Basculer le mode sans source
  const toggleWithoutSource = useCallback((withoutSource: boolean) => {
    updateDocuments({ withoutSource })
    
    // Si mode sans source activé, vider les fichiers
    if (withoutSource) {
      updateState({ uploadedFiles: [] })
    }
  }, [updateDocuments, updateState])

  // Réinitialiser le wizard
  const resetWizard = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.WIZARD_DATA)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP)
    setState(initialState)
    updateURL(1)
  }, [updateURL])

  // Marquer comme en cours de traitement
  const setProcessing = useCallback((isProcessing: boolean) => {
    updateState({ isProcessing })
  }, [updateState])

  // Calculer les estimations (mock)
  const calculateEstimations = useCallback(() => {
    const fileCount = state.uploadedFiles.length
    const methodologyCount = state.methodologies.methodologies.length
    
    // Estimation basique mockée
    const baseCost = fileCount * 0.50 + methodologyCount * 2.00
    const estimatedCost = Math.max(baseCost, 5.00) // Minimum 5€
    
    const baseDuration = fileCount * 2 + methodologyCount * 5 + 30 // en minutes
    const estimatedDuration = Math.max(baseDuration, 10) // Minimum 10 minutes
    
    updateGeneration({
      estimatedCost,
      estimatedDuration
    })
  }, [state.uploadedFiles.length, state.methodologies.methodologies.length, updateGeneration])

  // Obtenir un résumé des données pour affichage
  const getSummary = useCallback(() => {
    return {
      title: state.metadata.title,
      client: state.metadata.client,
      consultant: state.metadata.consultant,
      language: state.metadata.language,
      profile: state.metadata.profile,
      style: state.metadata.style,
      filesCount: state.uploadedFiles.length,
      withoutSource: state.documents.withoutSource,
      methodologies: state.methodologies.methodologies,
      ragOptions: state.generation.ragOptions,
      estimatedCost: state.generation.estimatedCost,
      estimatedDuration: state.generation.estimatedDuration,
    }
  }, [state])

  return {
    // État
    ...state,
    
    // Validation
    validateCurrentStep,
    canProceedToNextStep,
    
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    
    // Mise à jour des données
    updateMetadata,
    updateDocuments,
    updateMethodologies,
    updateGeneration,
    
    // Gestion des fichiers
    addFiles,
    removeFile,
    updateFileStatus,
    toggleWithoutSource,
    
    // Utilitaires
    resetWizard,
    setProcessing,
    calculateEstimations,
    getSummary,
  }
}

export default useWizardProgress
