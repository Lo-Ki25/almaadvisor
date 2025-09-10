"use client"

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MetadataFormData, metadataSchema } from '@/lib/validations/wizard'

interface MetadataStepProps {
  data: MetadataFormData
  onUpdate: (data: Partial<MetadataFormData>) => void
  onNext: () => void
  isValid: boolean
  errors: string[]
}

export function MetadataStep({ data, onUpdate, onNext, isValid, errors }: MetadataStepProps) {
  const form = useForm<MetadataFormData>({
    resolver: zodResolver(metadataSchema),
    defaultValues: data,
    mode: 'onChange', // Validation en temps réel
  })

  // Synchroniser les changements avec le parent
  React.useEffect(() => {
    const subscription = form.watch((values) => {
      // Filtrer les valeurs undefined pour éviter d'écraser les données existantes
      const cleanValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key as keyof MetadataFormData] = value as any
        }
        return acc
      }, {} as Partial<MetadataFormData>)
      
      if (Object.keys(cleanValues).length > 0) {
        onUpdate(cleanValues)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, onUpdate])

  // Synchroniser les données externes avec le form
  React.useEffect(() => {
    form.reset(data)
  }, [data, form])

  const handleSubmit = form.handleSubmit(() => {
    if (isValid) {
      onNext()
    }
  })

  const isFormValid = form.formState.isValid

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Métadonnées du projet
        </CardTitle>
        <CardDescription>
          Informations générales qui guideront la génération du rapport
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errors.length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Titre du projet */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre du projet *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Transformation digitale Morocco Alumni"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Titre descriptif qui apparaîtra sur la première page du rapport
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Client */}
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Morocco Alumni"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nom de l'organisation ou entreprise cliente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Consultant */}
              <FormField
                control={form.control}
                name="consultant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultant principal</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nom du consultant (optionnel)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Nom du consultant qui apparaîtra dans les métadonnées
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Langue */}
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Langue du rapport</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Langue principale du rapport généré
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Profil du comité */}
              <FormField
                control={form.control}
                name="profile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profil du comité *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le profil" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="institutionnel">
                          🏛️ Institutionnel
                        </SelectItem>
                        <SelectItem value="technique">
                          ⚙️ Technique
                        </SelectItem>
                        <SelectItem value="mixte">
                          🔄 Mixte
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Influence le niveau de détail et le vocabulaire utilisé
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Style de rédaction */}
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style de rédaction *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner le style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cabinet">
                          💼 Cabinet pur
                        </SelectItem>
                        <SelectItem value="pedagogique">
                          📚 Pédagogique
                        </SelectItem>
                        <SelectItem value="mixte">
                          ⚖️ Mixte
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Approche et ton du rapport (formel, explicatif, équilibré)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Informations de validation */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  <span className={isFormValid ? "text-green-600" : "text-amber-600"}>
                    {isFormValid ? "✓" : "⚠"} Métadonnées {isFormValid ? "complètes" : "incomplètes"}
                  </span>
                </div>
                <Button 
                  type="submit"
                  disabled={!isFormValid}
                  className="min-w-24"
                >
                  Suivant →
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
