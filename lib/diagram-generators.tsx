export interface DiagramGenerator {
  generateDiagram(context: string, projectData: any): string
}

export class C4ContextDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    const systemName = projectData.title || "System"
    const client = projectData.client || "Client"

    return `graph TB
    User[👤 ${client} Users]
    System[🏢 ${systemName}]
    ExtDB[(🗄️ External Database)]
    ExtAPI[🔌 External APIs]
    
    User -->|Uses| System
    System -->|Reads/Writes| ExtDB
    System -->|Integrates| ExtAPI
    
    classDef system fill:#e1f5fe
    classDef external fill:#fff3e0
    classDef user fill:#f3e5f5
    
    class System system
    class ExtDB,ExtAPI external
    class User user`
  }
}

export class C4ContainerDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `graph TB
    subgraph "Web Browser"
        WebApp[📱 Web Application<br/>React/Next.js]
    end
    
    subgraph "Mobile"
        MobileApp[📱 Mobile App<br/>React Native]
    end
    
    subgraph "Backend Services"
        API[🔌 API Gateway<br/>Node.js/Express]
        AuthService[🔐 Auth Service<br/>JWT/OAuth]
        BusinessLogic[⚙️ Business Logic<br/>Microservices]
    end
    
    subgraph "Data Layer"
        Database[(🗄️ Database<br/>PostgreSQL)]
        Cache[(⚡ Cache<br/>Redis)]
        FileStorage[(📁 File Storage<br/>S3)]
    end
    
    WebApp -->|HTTPS/REST| API
    MobileApp -->|HTTPS/REST| API
    API -->|Validates| AuthService
    API -->|Processes| BusinessLogic
    BusinessLogic -->|Stores| Database
    BusinessLogic -->|Caches| Cache
    BusinessLogic -->|Files| FileStorage
    
    classDef frontend fill:#e3f2fd
    classDef backend fill:#e8f5e8
    classDef data fill:#fff3e0
    
    class WebApp,MobileApp frontend
    class API,AuthService,BusinessLogic backend
    class Database,Cache,FileStorage data`
  }
}

export class BPMNDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `graph LR
    Start([🚀 Début])
    UserRequest[📝 Demande Utilisateur]
    Validation{✅ Validation}
    Processing[⚙️ Traitement]
    Approval{👥 Approbation}
    Implementation[🔧 Implémentation]
    Testing[🧪 Tests]
    Deployment[🚀 Déploiement]
    End([✅ Fin])
    
    Start --> UserRequest
    UserRequest --> Validation
    Validation -->|Valide| Processing
    Validation -->|Invalide| UserRequest
    Processing --> Approval
    Approval -->|Approuvé| Implementation
    Approval -->|Rejeté| UserRequest
    Implementation --> Testing
    Testing -->|Succès| Deployment
    Testing -->|Échec| Implementation
    Deployment --> End
    
    classDef startEnd fill:#c8e6c9
    classDef process fill:#bbdefb
    classDef decision fill:#ffecb3
    
    class Start,End startEnd
    class UserRequest,Processing,Implementation,Testing,Deployment process
    class Validation,Approval decision`
  }
}

export class GanttDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `gantt
    title Feuille de Route - ${projectData.title || "Projet"}
    dateFormat  YYYY-MM-DD
    section Phase 1 - Fondations
    Analyse & Audit           :done,    audit, 2024-01-01, 2024-02-15
    Architecture Technique    :done,    arch, 2024-02-01, 2024-03-01
    Setup Infrastructure      :active,  infra, 2024-02-15, 2024-03-15
    
    section Phase 2 - Développement
    Core Features            :         core, 2024-03-01, 2024-05-01
    API Development          :         api, 2024-03-15, 2024-04-30
    Frontend Development     :         frontend, 2024-04-01, 2024-05-15
    
    section Phase 3 - Intégration
    Tests d'Intégration     :         integration, 2024-05-01, 2024-05-30
    Tests Utilisateurs      :         uat, 2024-05-15, 2024-06-15
    Sécurité & Conformité   :         security, 2024-05-30, 2024-06-30
    
    section Phase 4 - Déploiement
    Déploiement Pilote      :         pilot, 2024-06-15, 2024-07-15
    Formation Utilisateurs  :         training, 2024-07-01, 2024-07-30
    Go-Live Production      :         golive, 2024-07-15, 2024-08-01`
  }
}

export class STRIDEDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `graph TB
    subgraph "STRIDE Threat Model"
        S[🎭 Spoofing<br/>Usurpation d'identité]
        T[🔄 Tampering<br/>Altération des données]
        R[🚫 Repudiation<br/>Répudiation]
        I[👁️ Information Disclosure<br/>Divulgation d'informations]
        D[💥 Denial of Service<br/>Déni de service]
        E[⬆️ Elevation of Privilege<br/>Élévation de privilèges]
    end
    
    subgraph "Mitigations"
        Auth[🔐 Authentification forte<br/>MFA, SSO]
        Integrity[🔒 Intégrité des données<br/>Hashing, Signatures]
        Logging[📝 Journalisation<br/>Audit trails]
        Encryption[🛡️ Chiffrement<br/>TLS, AES]
        RateLimit[⏱️ Rate Limiting<br/>DDoS Protection]
        RBAC[👥 Contrôle d'accès<br/>RBAC, Least Privilege]
    end
    
    S --> Auth
    T --> Integrity
    R --> Logging
    I --> Encryption
    D --> RateLimit
    E --> RBAC
    
    classDef threat fill:#ffcdd2
    classDef mitigation fill:#c8e6c9
    
    class S,T,R,I,D,E threat
    class Auth,Integrity,Logging,Encryption,RateLimit,RBAC mitigation`
  }
}

export class ArchitectureDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `graph TB
    subgraph "Frontend Layer"
        Web[🌐 Web App]
        Mobile[📱 Mobile App]
        Admin[⚙️ Admin Panel]
    end
    
    subgraph "API Gateway"
        Gateway[🚪 API Gateway<br/>Rate Limiting, Auth]
    end
    
    subgraph "Microservices"
        UserService[👤 User Service]
        AuthService[🔐 Auth Service]
        BusinessService[💼 Business Service]
        NotificationService[📧 Notification Service]
    end
    
    subgraph "Data Layer"
        UserDB[(👤 User DB)]
        BusinessDB[(💼 Business DB)]
        Cache[(⚡ Redis Cache)]
        FileStorage[(📁 File Storage)]
    end
    
    subgraph "External Services"
        EmailProvider[📧 Email Provider]
        PaymentGateway[💳 Payment Gateway]
        Analytics[📊 Analytics]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    Admin --> Gateway
    
    Gateway --> UserService
    Gateway --> AuthService
    Gateway --> BusinessService
    Gateway --> NotificationService
    
    UserService --> UserDB
    BusinessService --> BusinessDB
    UserService --> Cache
    BusinessService --> Cache
    BusinessService --> FileStorage
    
    NotificationService --> EmailProvider
    BusinessService --> PaymentGateway
    Gateway --> Analytics
    
    classDef frontend fill:#e3f2fd
    classDef gateway fill:#fff3e0
    classDef service fill:#e8f5e8
    classDef data fill:#f3e5f5
    classDef external fill:#ffecb3
    
    class Web,Mobile,Admin frontend
    class Gateway gateway
    class UserService,AuthService,BusinessService,NotificationService service
    class UserDB,BusinessDB,Cache,FileStorage data
    class EmailProvider,PaymentGateway,Analytics external`
  }
}

export class C4ComponentDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `graph TB
    subgraph "Component Diagram - ${projectData.title || 'System'}"
        subgraph "API Layer"
            AuthComponent[🔐 Authentication Component]
            APIController[🔌 API Controller]
            Validation[✅ Validation Component]
        end
        
        subgraph "Business Layer"
            BusinessLogic[⚙️ Business Logic]
            DataAccess[📊 Data Access]
            EventHandler[📨 Event Handler]
        end
        
        subgraph "Infrastructure"
            Database[(🗄️ Database)]
            MessageQueue[📬 Message Queue]
            Cache[⚡ Cache]
        end
    end
    
    APIController --> AuthComponent
    APIController --> Validation
    APIController --> BusinessLogic
    BusinessLogic --> DataAccess
    BusinessLogic --> EventHandler
    DataAccess --> Database
    EventHandler --> MessageQueue
    BusinessLogic --> Cache
    
    classDef api fill:#e3f2fd
    classDef business fill:#e8f5e8
    classDef infra fill:#fff3e0
    
    class AuthComponent,APIController,Validation api
    class BusinessLogic,DataAccess,EventHandler business
    class Database,MessageQueue,Cache infra`
  }
}

export class FlowchartDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `flowchart TD
    A[🚀 Début du Processus] --> B{📋 Validation des Données}
    B -->|✅ Valide| C[⚙️ Traitement Principal]
    B -->|❌ Invalide| D[📝 Correction des Erreurs]
    D --> B
    C --> E{🔍 Contrôle Qualité}
    E -->|✅ Conforme| F[💾 Sauvegarde]
    E -->|❌ Non-conforme| G[🔧 Corrections]
    G --> C
    F --> H[📤 Notification]
    H --> I[✅ Fin du Processus]
    
    classDef startEnd fill:#c8e6c9
    classDef process fill:#bbdefb
    classDef decision fill:#ffecb3
    classDef error fill:#ffcdd2
    
    class A,I startEnd
    class C,F,H process
    class B,E decision
    class D,G error`
  }
}

export class SequenceDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `sequenceDiagram
    participant U as 👤 Utilisateur
    participant F as 🌐 Frontend
    participant A as 🔌 API Gateway
    participant S as ⚙️ Service Métier
    participant D as 🗄️ Base de Données
    
    U->>F: 📝 Demande
    F->>A: 🔐 Authentification
    A->>F: ✅ Token
    F->>A: 📤 Requête Métier
    A->>S: ⚙️ Traitement
    S->>D: 📊 Lecture/Écriture
    D->>S: 📋 Données
    S->>A: 📦 Résultat
    A->>F: 📥 Réponse
    F->>U: ✨ Affichage`
  }
}

export class ClassDiagramGenerator implements DiagramGenerator {
  generateDiagram(context: string, projectData: any): string {
    return `classDiagram
    class User {
        +String id
        +String name
        +String email
        +authenticate()
        +authorize()
    }
    
    class Project {
        +String id
        +String title
        +String status
        +Date createdAt
        +create()
        +update()
        +delete()
    }
    
    class Document {
        +String id
        +String name
        +String path
        +String mime
        +upload()
        +parse()
        +delete()
    }
    
    class Report {
        +String id
        +String markdown
        +String pdfPath
        +generate()
        +export()
        +view()
    }
    
    User "1" --> "*" Project : creates
    Project "1" --> "*" Document : contains
    Project "1" --> "1" Report : generates
    
    User ||--o{ Project : manages
    Project ||--o{ Document : includes`
  }
}

export class DiagramGeneratorFactory {
  static generators: Record<string, DiagramGenerator> = {
    "c4-context": new C4ContextDiagramGenerator(),
    "c4-container": new C4ContainerDiagramGenerator(),
    "c4-component": new C4ComponentDiagramGenerator(),
    bpmn: new BPMNDiagramGenerator(),
    gantt: new GanttDiagramGenerator(),
    stride: new STRIDEDiagramGenerator(),
    architecture: new ArchitectureDiagramGenerator(),
    flowchart: new FlowchartDiagramGenerator(),
    sequence: new SequenceDiagramGenerator(),
    class: new ClassDiagramGenerator(),
  }

  static generateDiagram(type: string, context: string, projectData: any): string {
    const generator = this.generators[type]
    if (!generator) {
      throw new Error(`Unknown diagram type: ${type}`)
    }
    return generator.generateDiagram(context, projectData)
  }

  static getSupportedTypes(): string[] {
    return Object.keys(this.generators)
  }
}
