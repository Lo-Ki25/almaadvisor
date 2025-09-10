// Templates de diagrammes Mermaid avec des exemples complets
export interface DiagramTemplate {
  id: string
  name: string
  category: string
  description: string
  template: string
}

export const diagramTemplates: DiagramTemplate[] = [
  {
    id: "c4-context",
    name: "C4 - Diagramme de Contexte",
    category: "Architecture",
    description: "Vue d'ensemble du système et de ses interactions avec les utilisateurs et systèmes externes",
    template: `graph TB
    User[👤 Utilisateur Final<br/>Client de l'application]
    Admin[👨‍💼 Administrateur<br/>Gestion du système]
    System[🏢 Système Principal<br/>Application ALMA-ADVISOR]
    Database[🗄️ Base de Données<br/>PostgreSQL]
    EmailSystem[📧 Système Email<br/>Service de notification]
    FileStorage[📁 Stockage Fichiers<br/>Système de fichiers]
    AuthProvider[🔐 Fournisseur Auth<br/>Service d'authentification]
    
    User -->|Utilise| System
    Admin -->|Administre| System
    System -->|Stocke les données| Database
    System -->|Envoie des emails| EmailSystem
    System -->|Sauvegarde fichiers| FileStorage
    System -->|Authentifie via| AuthProvider
    
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef systemClass fill:#f3e5f5,stroke:#4a148c,stroke-width:3px,color:#000
    classDef externalClass fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    
    class User,Admin userClass
    class System systemClass
    class Database,EmailSystem,FileStorage,AuthProvider externalClass`
  },
  {
    id: "c4-container",
    name: "C4 - Diagramme de Conteneurs",
    category: "Architecture",
    description: "Décomposition du système en conteneurs applicatifs",
    template: `graph TB
    subgraph "Système ALMA-ADVISOR"
        WebApp[🌐 Application Web<br/>Next.js / React<br/>Interface utilisateur]
        API[🔌 API Backend<br/>Node.js / Next.js API Routes<br/>Logique métier]
        Database[🗄️ Base de Données<br/>PostgreSQL<br/>Stockage des données]
        FileSystem[📁 Système de Fichiers<br/>Local/Cloud Storage<br/>Documents uploadés]
        Queue[⚡ File de Messages<br/>Redis/RabbitMQ<br/>Traitement asynchrone]
    end
    
    User[👤 Utilisateur] -->|HTTPS| WebApp
    WebApp -->|API REST/GraphQL| API
    API -->|SQL| Database
    API -->|Lit/Écrit| FileSystem
    API -->|Publie/Consomme| Queue
    Queue -->|Traite| API
    
    classDef containerClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef userClass fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef dataClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    
    class WebApp,API containerClass
    class User userClass
    class Database,FileSystem,Queue dataClass`
  },
  {
    id: "bpmn-process",
    name: "BPMN 2.0 - Processus Métier",
    category: "Processus",
    description: "Modélisation de processus métier avec notation BPMN",
    template: `graph TD
    Start([🚀 Début du Processus<br/>Nouveau Projet RAG]) 
    --> Input[📋 Saisie des Métadonnées<br/>Titre, Client, Méthodologies]
    
    Input --> Upload[📤 Upload Documents<br/>PDF, DOCX, CSV, etc.]
    
    Upload --> ProcessDocs{📊 Traitement<br/>des Documents}
    ProcessDocs -->|Succès| Extract[🔍 Extraction du Contenu<br/>Parsing et indexation]
    ProcessDocs -->|Erreur| ErrorHandle[❌ Gestion d'Erreur<br/>Notification utilisateur]
    
    Extract --> Generate[⚙️ Génération du Rapport<br/>Analyse et rédaction]
    
    Generate --> Review{👀 Révision<br/>Qualité OK?}
    Review -->|Oui| Approve[✅ Validation<br/>Rapport approuvé]
    Review -->|Non| Revise[📝 Révision<br/>Corrections nécessaires]
    
    Revise --> Generate
    Approve --> Export[📄 Export<br/>PDF, ZIP avec annexes]
    Export --> End([🏁 Fin du Processus<br/>Livraison client])
    
    ErrorHandle --> Input
    
    classDef startEnd fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px,color:#000
    classDef task fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef decision fill:#ffebee,stroke:#d32f2f,stroke-width:2px,color:#000
    classDef error fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    
    class Start,End startEnd
    class Input,Upload,Extract,Generate,Approve,Revise,Export task
    class ProcessDocs,Review decision
    class ErrorHandle error`
  },
  {
    id: "gantt",
    name: "Diagramme de Gantt",
    category: "Planification",
    description: "Planning de projet avec phases et jalons",
    template: `gantt
    title Roadmap de Transformation Digitale
    dateFormat YYYY-MM-DD
    
    section Phase 1 - Analyse
    Audit de l'existant           :done,    audit, 2024-01-01, 2024-01-21
    Benchmarking                  :done,    bench, 2024-01-15, 2024-02-05
    Analyse des écarts            :active,  gaps,  2024-02-01, 2024-02-21
    
    section Phase 2 - Conception
    Architecture cible            :         arch,  after gaps, 30d
    Modélisation processus        :         proc,  after gaps, 25d
    Spécifications techniques     :         specs, after arch, 20d
    
    section Phase 3 - Développement
    MVP Development               :         mvp,   after specs, 45d
    Intégrations API              :         api,   after mvp, 30d
    Tests utilisateur             :         tests, after api, 15d
    
    section Phase 4 - Déploiement
    Formation équipes             :         train, after tests, 10d
    Migration données             :         migr,  after train, 20d
    Go-Live                       :         live,  after migr, 5d
    Support post-lancement        :         supp,  after live, 30d
    
    section Jalons
    Livraison Phase 1             :milestone, m1, after gaps, 0d
    Validation Architecture       :milestone, m2, after specs, 0d
    Recette MVP                   :milestone, m3, after tests, 0d
    Go-Live Production            :milestone, m4, after live, 0d`
  },
  {
    id: "stride",
    name: "STRIDE - Analyse des Menaces",
    category: "Sécurité", 
    description: "Modélisation des menaces selon le framework STRIDE",
    template: `graph TD
    System[🏢 Système ALMA-ADVISOR] --> Assets
    
    subgraph Assets["🎯 Actifs à Protéger"]
        UserData[👥 Données Utilisateurs<br/>Profils, préférences]
        DocData[📄 Documents Clients<br/>Rapports, fichiers]
        AuthData[🔐 Données d'Auth<br/>Tokens, sessions]
        SysData[⚙️ Données Système<br/>Logs, configuration]
    end
    
    subgraph Threats["⚠️ Menaces STRIDE"]
        S[🎭 Spoofing<br/>Usurpation d'identité]
        T[🔧 Tampering<br/>Altération des données]
        R[❌ Repudiation<br/>Non-répudiation]
        I[👁️ Information Disclosure<br/>Fuite d'informations]
        D[💥 Denial of Service<br/>Déni de service]
        E[👑 Elevation of Privilege<br/>Élévation de privilèges]
    end
    
    subgraph Controls["🛡️ Contrôles de Sécurité"]
        Auth[🔒 Authentification Multi-Facteurs]
        Encrypt[🔐 Chiffrement bout-en-bout]
        Audit[📊 Logs d'audit]
        Access[👮 Contrôle d'accès RBAC]
        Monitor[📡 Monitoring sécurité]
        Backup[💾 Sauvegarde sécurisée]
    end
    
    S -.->|Mitige| Auth
    T -.->|Mitige| Encrypt
    R -.->|Mitige| Audit  
    I -.->|Mitige| Access
    D -.->|Mitige| Monitor
    E -.->|Mitige| Access
    
    classDef assetClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef threatClass fill:#ffebee,stroke:#d32f2f,stroke-width:2px,color:#000
    classDef controlClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef systemClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000
    
    class UserData,DocData,AuthData,SysData assetClass
    class S,T,R,I,D,E threatClass
    class Auth,Encrypt,Audit,Access,Monitor,Backup controlClass
    class System systemClass`
  },
  {
    id: "business-canvas",
    name: "Business Model Canvas",
    category: "Stratégie",
    description: "Modèle économique selon le Business Model Canvas",
    template: `graph TB
    subgraph "Business Model Canvas - ALMA-ADVISOR"
        subgraph "Partenaires Clés"
            Partners[🤝 Éditeurs Logiciels<br/>Intégrateurs Système<br/>Consultants Partenaires<br/>Fournisseurs Cloud]
        end
        
        subgraph "Activités Clés"  
            Activities[⚙️ Développement Plateforme<br/>Analyses et Rapports<br/>Support Client<br/>R&D Méthodologies]
        end
        
        subgraph "Ressources Clés"
            Resources[🏗️ Équipe Technique<br/>Base de Connaissances<br/>Algorithmes IA<br/>Plateforme SaaS]
        end
        
        subgraph "Propositions de Valeur"
            Value[💎 Automatisation Rapports<br/>Méthodologies Éprouvées<br/>Gain de Temps 80%<br/>Qualité Consistante]
        end
        
        subgraph "Relations Clients"
            Relations[👥 Support Dédié<br/>Formation Continue<br/>Communauté Utilisateurs<br/>Retours Personnalisés]
        end
        
        subgraph "Canaux"
            Channels[📢 Site Web Direct<br/>Partenaires Intégrateurs<br/>Events & Webinaires<br/>Marketing Digital]
        end
        
        subgraph "Segments Clients"
            Segments[🎯 Cabinets Conseil<br/>DSI Entreprises<br/>Intégrateurs SI<br/>Consultants Indépendants]
        end
        
        subgraph "Structure de Coûts"
            Costs[💰 R&D Plateforme<br/>Infrastructure Cloud<br/>Équipe Commerciale<br/>Marketing Acquisition]
        end
        
        subgraph "Sources de Revenus"
            Revenue[💵 Abonnement SaaS<br/>Licences Entreprise<br/>Services Consulting<br/>Formation Premium]
        end
    end
    
    Partners -.-> Activities
    Activities -.-> Value
    Resources -.-> Value
    Value -.-> Relations
    Value -.-> Channels
    Relations -.-> Segments
    Channels -.-> Segments
    
    classDef keyClass fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    classDef valueClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000
    classDef customerClass fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef financeClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    
    class Partners,Activities,Resources keyClass
    class Value valueClass  
    class Relations,Channels,Segments customerClass
    class Costs,Revenue financeClass`
  }
]

export const getTemplateById = (id: string): DiagramTemplate | undefined => {
  return diagramTemplates.find(template => template.id === id)
}

export const getTemplatesByCategory = (category: string): DiagramTemplate[] => {
  return diagramTemplates.filter(template => template.category === category)
}

export const getAllCategories = (): string[] => {
  return [...new Set(diagramTemplates.map(template => template.category))]
}
