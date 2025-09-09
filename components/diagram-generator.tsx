"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Code, Palette, RefreshCw } from "lucide-react"

interface DiagramGeneratorProps {
  initialType?: string
  initialData?: any
  onSave?: (diagramCode: string, diagramType: string) => void
}

export function DiagramGenerator({ initialType = "c4-context", initialData, onSave }: DiagramGeneratorProps) {
  const [diagramType, setDiagramType] = useState(initialType)
  const [mermaidCode, setMermaidCode] = useState("")
  const [isPreviewMode, setIsPreviewMode] = useState(true)
  const diagramRef = useRef<HTMLDivElement>(null)

  const diagramTemplates = {
    "c4-context": {
      name: "C4 - System Context",
      category: "Architecture",
      template: `graph TB
    User[👤 User<br/>End User]
    System[🏢 System Name<br/>Main System]
    ExtSystem1[📊 External System 1<br/>Third Party Service]
    ExtSystem2[🗄️ External System 2<br/>Database System]
    
    User -->|Uses| System
    System -->|Gets data from| ExtSystem1
    System -->|Stores data in| ExtSystem2
    
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef systemClass fill:#f3e5f5,stroke:#4a148c,stroke-width:3px
    classDef externalClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class User userClass
    class System systemClass
    class ExtSystem1,ExtSystem2 externalClass`,
    },
    "c4-container": {
      name: "C4 - Container Diagram",
      category: "Architecture",
      template: `graph TB
    subgraph "System Boundary"
        WebApp[🌐 Web Application<br/>React/Next.js]
        API[🔌 API Gateway<br/>Node.js/Express]
        Database[🗄️ Database<br/>PostgreSQL]
        Cache[⚡ Cache<br/>Redis]
    end
    
    User[👤 User] -->|HTTPS| WebApp
    WebApp -->|API Calls| API
    API -->|Reads/Writes| Database
    API -->|Caches| Cache
    
    classDef containerClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    
    class WebApp,API,Database,Cache containerClass
    class User userClass`,
    },
    "bpmn-process": {
      name: "BPMN 2.0 Process",
      category: "Process",
      template: `graph TD
    Start([🚀 Start Process]) --> Task1[📋 Task 1<br/>Initial Assessment]
    Task1 --> Decision{🤔 Decision Point}
    Decision -->|Yes| Task2[✅ Approve Process]
    Decision -->|No| Task3[❌ Reject Process]
    Task2 --> Task4[📧 Send Notification]
    Task3 --> Task5[📝 Document Rejection]
    Task4 --> End([🏁 End Process])
    Task5 --> End
    
    classDef startEnd fill:#c8e6c9,stroke:#388e3c,stroke-width:2px
    classDef task fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef decision fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    
    class Start,End startEnd
    class Task1,Task2,Task3,Task4,Task5 task
    class Decision decision`,
    },
    "business-canvas": {
      name: "Business Model Canvas",
      category: "Strategy",
      template: `graph TB
    subgraph "Business Model Canvas"
        subgraph "Key Partners"
            KP[🤝 Strategic Alliances<br/>Technology Partners<br/>Suppliers]
        end
        
        subgraph "Key Activities"
            KA[⚙️ Platform Development<br/>Customer Support<br/>Marketing]
        end
        
        subgraph "Value Propositions"
            VP[💎 Unique Value<br/>Problem Solving<br/>Innovation]
        end
        
        subgraph "Customer Relationships"
            CR[👥 Personal Assistance<br/>Self-Service<br/>Community]
        end
        
        subgraph "Customer Segments"
            CS[🎯 Target Market<br/>Niche Segments<br/>Mass Market]
        end
        
        subgraph "Key Resources"
            KR[🏗️ Technology<br/>Human Resources<br/>Brand]
        end
        
        subgraph "Channels"
            CH[📢 Direct Sales<br/>Online Platform<br/>Partners]
        end
        
        subgraph "Cost Structure"
            COST[💰 Fixed Costs<br/>Variable Costs<br/>Economies of Scale]
        end
        
        subgraph "Revenue Streams"
            REV[💵 Subscription<br/>Transaction Fees<br/>Licensing]
        end
    end
    
    classDef canvas fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    class KP,KA,VP,CR,CS,KR,CH,COST,REV canvas`,
    },
    "togaf-adm": {
      name: "TOGAF ADM Phases",
      category: "Architecture",
      template: `graph TD
    Prelim[📋 Preliminary Phase<br/>Framework Setup] --> PhaseA[🎯 Phase A<br/>Architecture Vision]
    PhaseA --> PhaseB[🏢 Phase B<br/>Business Architecture]
    PhaseB --> PhaseC[💻 Phase C<br/>Information Systems Architecture]
    PhaseC --> PhaseD[🔧 Phase D<br/>Technology Architecture]
    PhaseD --> PhaseE[📊 Phase E<br/>Opportunities & Solutions]
    PhaseE --> PhaseF[📈 Phase F<br/>Migration Planning]
    PhaseF --> PhaseG[🚀 Phase G<br/>Implementation Governance]
    PhaseG --> PhaseH[🔄 Phase H<br/>Architecture Change Management]
    PhaseH --> PhaseA
    
    Requirements[📝 Requirements Management] -.-> PhaseA
    Requirements -.-> PhaseB
    Requirements -.-> PhaseC
    Requirements -.-> PhaseD
    Requirements -.-> PhaseE
    Requirements -.-> PhaseF
    Requirements -.-> PhaseG
    Requirements -.-> PhaseH
    
    classDef phase fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef requirements fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    
    class Prelim,PhaseA,PhaseB,PhaseC,PhaseD,PhaseE,PhaseF,PhaseG,PhaseH phase
    class Requirements requirements`,
    },
    "risk-matrix": {
      name: "Risk Analysis Matrix",
      category: "Risk",
      template: `graph TD
    subgraph "Risk Assessment Matrix"
        subgraph "High Impact"
            H1[🔴 Critical Risk 1<br/>High Impact, High Probability]
            H2[🟡 Major Risk 2<br/>High Impact, Medium Probability]
            H3[🟢 Risk 3<br/>High Impact, Low Probability]
        end
        
        subgraph "Medium Impact"
            M1[🟡 Risk 4<br/>Medium Impact, High Probability]
            M2[🟡 Risk 5<br/>Medium Impact, Medium Probability]
            M3[🟢 Risk 6<br/>Medium Impact, Low Probability]
        end
        
        subgraph "Low Impact"
            L1[🟢 Risk 7<br/>Low Impact, High Probability]
            L2[🟢 Risk 8<br/>Low Impact, Medium Probability]
            L3[🟢 Risk 9<br/>Low Impact, Low Probability]
        end
    end
    
    classDef critical fill:#ffebee,stroke:#d32f2f,stroke-width:3px
    classDef major fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef minor fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class H1 critical
    class H2,M1,M2 major
    class H3,M3,L1,L2,L3 minor`,
    },
    roadmap: {
      name: "Implementation Roadmap",
      category: "Planning",
      template: `gantt
    title Implementation Roadmap
    dateFormat  YYYY-MM-DD
    section Phase 1 - Foundation
    Architecture Design    :done, arch, 2024-01-01, 2024-02-15
    Infrastructure Setup   :done, infra, 2024-02-01, 2024-03-01
    Security Framework     :active, security, 2024-02-15, 2024-03-15
    
    section Phase 2 - Development
    Core Platform         :dev1, after security, 60d
    API Development       :dev2, after security, 45d
    Frontend Development  :dev3, after dev2, 30d
    
    section Phase 3 - Integration
    System Integration    :int1, after dev1, 30d
    Testing & QA          :test, after int1, 20d
    User Training         :training, after test, 15d
    
    section Phase 4 - Deployment
    Production Deployment :deploy, after training, 10d
    Go-Live Support      :support, after deploy, 30d`,
    },
    organizational: {
      name: "Organizational Structure",
      category: "Organization",
      template: `graph TD
    CEO[👑 CEO<br/>Chief Executive Officer]
    
    CTO[💻 CTO<br/>Chief Technology Officer]
    CFO[💰 CFO<br/>Chief Financial Officer]
    COO[⚙️ COO<br/>Chief Operating Officer]
    
    DevTeam[👨‍💻 Development Team<br/>Software Engineers]
    InfraTeam[🏗️ Infrastructure Team<br/>DevOps Engineers]
    SecurityTeam[🛡️ Security Team<br/>Security Specialists]
    
    Finance[📊 Finance Department<br/>Financial Analysts]
    Operations[🔄 Operations Department<br/>Business Analysts]
    
    CEO --> CTO
    CEO --> CFO
    CEO --> COO
    
    CTO --> DevTeam
    CTO --> InfraTeam
    CTO --> SecurityTeam
    
    CFO --> Finance
    COO --> Operations
    
    classDef executive fill:#e1f5fe,stroke:#01579b,stroke-width:3px
    classDef manager fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef team fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    
    class CEO executive
    class CTO,CFO,COO manager
    class DevTeam,InfraTeam,SecurityTeam,Finance,Operations team`,
    },
  }

  useEffect(() => {
    if (initialData && diagramType) {
      generateDiagramFromData(diagramType, initialData)
    } else {
      setMermaidCode(diagramTemplates[diagramType as keyof typeof diagramTemplates]?.template || "")
    }
  }, [diagramType, initialData])

  useEffect(() => {
    if (isPreviewMode && mermaidCode && diagramRef.current) {
      renderMermaidDiagram()
    }
  }, [mermaidCode, isPreviewMode])

  const generateDiagramFromData = (type: string, data: any) => {
    // Generate diagram code based on methodology data
    switch (type) {
      case "c4-context":
        if (data.systemName) {
          const code = `graph TB
    User[👤 User<br/>End User]
    System[🏢 ${data.systemName}<br/>${data.systemPurpose || "Main System"}]
    ${
      data.externalSystems
        ? data.externalSystems
            .split("\n")
            .map((sys: string, i: number) => `ExtSystem${i + 1}[📊 ${sys.trim()}<br/>External System]`)
            .join("\n    ")
        : ""
    }
    
    User -->|Uses| System
    ${
      data.externalSystems
        ? data.externalSystems
            .split("\n")
            .map((sys: string, i: number) => `System -->|Integrates with| ExtSystem${i + 1}`)
            .join("\n    ")
        : ""
    }
    
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef systemClass fill:#f3e5f5,stroke:#4a148c,stroke-width:3px
    classDef externalClass fill:#fff3e0,stroke:#e65100,stroke-width:2px
    
    class User userClass
    class System systemClass
    ${
      data.externalSystems
        ? data.externalSystems
            .split("\n")
            .map((sys: string, i: number) => `ExtSystem${i + 1}`)
            .join(",") + " externalClass"
        : ""
    }`
          setMermaidCode(code)
        }
        break
      case "business-canvas":
        if (data.valuePropositions) {
          // Generate Business Model Canvas from data
          const code = diagramTemplates["business-canvas"].template.replace(
            "💎 Unique Value<br/>Problem Solving<br/>Innovation",
            `💎 ${data.valuePropositions.split("\n").slice(0, 3).join("<br/>")}`,
          )
          setMermaidCode(code)
        }
        break
      default:
        setMermaidCode(diagramTemplates[type as keyof typeof diagramTemplates]?.template || "")
    }
  }

  const renderMermaidDiagram = async () => {
    if (!diagramRef.current || !mermaidCode) return

    try {
      // Import mermaid dynamically
      const mermaid = (await import("mermaid")).default

      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        themeVariables: {
          primaryColor: "#059669",
          primaryTextColor: "#ffffff",
          primaryBorderColor: "#047857",
          lineColor: "#6b7280",
          sectionBkgColor: "#f9fafb",
          altSectionBkgColor: "#ffffff",
          gridColor: "#e5e7eb",
          secondaryColor: "#10b981",
          tertiaryColor: "#f3f4f6",
        },
      })

      // Clear previous diagram
      diagramRef.current.innerHTML = ""

      // Generate unique ID for this diagram
      const diagramId = `diagram-${Date.now()}`

      // Render the diagram
      const { svg } = await mermaid.render(diagramId, mermaidCode)
      diagramRef.current.innerHTML = svg
    } catch (error) {
      console.error("Error rendering Mermaid diagram:", error)
      diagramRef.current.innerHTML = `<div class="text-red-500 p-4">Error rendering diagram: ${error}</div>`
    }
  }

  const handleExportSVG = async () => {
    if (!diagramRef.current) return

    const svgElement = diagramRef.current.querySelector("svg")
    if (!svgElement) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `diagram-${diagramType}-${Date.now()}.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSave = () => {
    onSave?.(mermaidCode, diagramType)
  }

  const categories = [...new Set(Object.values(diagramTemplates).map((t) => t.category))]
  const selectedTemplate = diagramTemplates[diagramType as keyof typeof diagramTemplates]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Générateur de Diagrammes
          </CardTitle>
          <CardDescription>
            Créez des diagrammes professionnels pour vos rapports de transformation digitale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Select value={diagramType} onValueChange={setDiagramType}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type de diagramme" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">{category}</div>
                      {Object.entries(diagramTemplates)
                        .filter(([_, template]) => template.category === category)
                        .map(([key, template]) => (
                          <SelectItem key={key} value={key}>
                            {template.name}
                          </SelectItem>
                        ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant={isPreviewMode ? "default" : "outline"} size="sm" onClick={() => setIsPreviewMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>
              <Button
                variant={!isPreviewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreviewMode(false)}
              >
                <Code className="h-4 w-4 mr-2" />
                Code
              </Button>
            </div>
          </div>

          {selectedTemplate && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedTemplate.category}</Badge>
              <span className="text-sm text-muted-foreground">{selectedTemplate.name}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Code Mermaid</CardTitle>
            <CardDescription>Modifiez le code pour personnaliser votre diagramme</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              className="font-mono text-sm min-h-[400px] resize-none"
              placeholder="Entrez votre code Mermaid ici..."
            />
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Aperçu</CardTitle>
                <CardDescription>Prévisualisation de votre diagramme</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={renderMermaidDiagram}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
                <Button size="sm" variant="outline" onClick={handleExportSVG}>
                  <Download className="h-4 w-4 mr-2" />
                  SVG
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              ref={diagramRef}
              className="min-h-[400px] border rounded-lg p-4 bg-white overflow-auto"
              style={{ minHeight: "400px" }}
            >
              {!mermaidCode && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Sélectionnez un type de diagramme pour commencer
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {onSave && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>Sauvegarder le Diagramme</Button>
        </div>
      )}
    </div>
  )
}
