export interface TableGenerator {
  generateTable(context: string, projectData: any): string
}

export class RICETableGenerator implements TableGenerator {
  generateTable(context: string, projectData: any): string {
    const features = [
      { feature: "Authentification SSO", reach: 9, impact: 8, confidence: 9, effort: 5 },
      { feature: "Moteur de recherche", reach: 8, impact: 7, confidence: 8, effort: 8 },
      { feature: "Application mobile", reach: 7, impact: 8, confidence: 7, effort: 9 },
      { feature: "Analytics avancées", reach: 6, impact: 6, confidence: 8, effort: 6 },
      { feature: "Notifications push", reach: 8, impact: 5, confidence: 9, effort: 4 },
      { feature: "API publique", reach: 5, impact: 7, confidence: 7, effort: 7 },
    ]

    let csv = "Fonctionnalité,Reach,Impact,Confidence,Effort,Score RICE,Priorité\n"

    const scored = features
      .map((f) => ({
        ...f,
        score: (f.reach * f.impact * f.confidence) / f.effort,
      }))
      .sort((a, b) => b.score - a.score)

    scored.forEach((f, index) => {
      const priority = index < 2 ? "P1" : index < 4 ? "P2" : "P3"
      csv += `${f.feature},${f.reach},${f.impact},${f.confidence},${f.effort},${f.score.toFixed(1)},${priority}\n`
    })

    return csv
  }
}

export class BudgetTableGenerator implements TableGenerator {
  generateTable(context: string, projectData: any): string {
    let csv = "Phase,Catégorie,Poste,Montant (€),Type,Période\n"

    const budget = [
      {
        phase: "P1",
        category: "Infrastructure",
        item: "Cloud Platform",
        amount: 45000,
        type: "CAPEX",
        period: "6 mois",
      },
      {
        phase: "P1",
        category: "Développement",
        item: "Équipe Dev (3 FTE)",
        amount: 180000,
        type: "OPEX",
        period: "6 mois",
      },
      {
        phase: "P1",
        category: "Sécurité",
        item: "Audit & Pentesting",
        amount: 25000,
        type: "CAPEX",
        period: "Ponctuel",
      },
      { phase: "P2", category: "Développement", item: "Features Core", amount: 240000, type: "OPEX", period: "8 mois" },
      {
        phase: "P2",
        category: "Infrastructure",
        item: "Monitoring & Logs",
        amount: 18000,
        type: "OPEX",
        period: "8 mois",
      },
      { phase: "P3", category: "Mobile", item: "App iOS/Android", amount: 120000, type: "CAPEX", period: "6 mois" },
      { phase: "P3", category: "Analytics", item: "BI Platform", amount: 35000, type: "CAPEX", period: "4 mois" },
      { phase: "P4", category: "Formation", item: "Change Management", amount: 40000, type: "OPEX", period: "3 mois" },
    ]

    budget.forEach((b) => {
      csv += `${b.phase},${b.category},${b.item},${b.amount},${b.type},${b.period}\n`
    })

    return csv
  }
}

export class RACITableGenerator implements TableGenerator {
  generateTable(context: string, projectData: any): string {
    let csv = "Activité,DSI,Chef Projet,Architecte,Développeurs,Utilisateurs,Direction\n"

    const activities = [
      { activity: "Définition Architecture", dsi: "A", pm: "R", arch: "R", dev: "C", users: "I", dir: "A" },
      { activity: "Développement Features", dsi: "A", pm: "A", arch: "C", dev: "R", users: "I", dir: "I" },
      { activity: "Tests Utilisateurs", dsi: "I", pm: "A", arch: "I", dev: "C", users: "R", dir: "I" },
      { activity: "Déploiement Production", dsi: "R", pm: "A", arch: "C", dev: "R", users: "I", dir: "A" },
      { activity: "Formation Utilisateurs", dsi: "C", pm: "A", arch: "I", dev: "I", users: "R", dir: "A" },
      { activity: "Maintenance & Support", dsi: "A", pm: "I", arch: "C", dev: "R", users: "I", dir: "I" },
    ]

    activities.forEach((a) => {
      csv += `${a.activity},${a.dsi},${a.pm},${a.arch},${a.dev},${a.users},${a.dir}\n`
    })

    return csv
  }
}

export class BSCTableGenerator implements TableGenerator {
  generateTable(context: string, projectData: any): string {
    let csv = "Perspective,KPI,Cible,Fréquence,Responsable\n"

    const kpis = [
      { perspective: "Financière", kpi: "ROI Projet", target: "> 25%", frequency: "Trimestriel", owner: "Direction" },
      {
        perspective: "Financière",
        kpi: "Coût par Utilisateur",
        target: "< 15€/mois",
        frequency: "Mensuel",
        owner: "DSI",
      },
      {
        perspective: "Client",
        kpi: "Satisfaction Utilisateurs",
        target: "> 4.2/5",
        frequency: "Mensuel",
        owner: "Product Owner",
      },
      {
        perspective: "Client",
        kpi: "Taux d'Adoption",
        target: "> 75%",
        frequency: "Hebdomadaire",
        owner: "Chef Projet",
      },
      {
        perspective: "Processus",
        kpi: "Disponibilité Système",
        target: "> 99.5%",
        frequency: "Temps réel",
        owner: "SRE",
      },
      {
        perspective: "Processus",
        kpi: "Temps de Réponse",
        target: "< 2s",
        frequency: "Temps réel",
        owner: "Architecte",
      },
      { perspective: "Apprentissage", kpi: "Formation Équipe", target: "100%", frequency: "Trimestriel", owner: "RH" },
      {
        perspective: "Apprentissage",
        kpi: "Veille Technologique",
        target: "2h/semaine",
        frequency: "Mensuel",
        owner: "Tech Lead",
      },
    ]

    kpis.forEach((k) => {
      csv += `${k.perspective},${k.kpi},${k.target},${k.frequency},${k.owner}\n`
    })

    return csv
  }
}

export class TableGeneratorFactory {
  static generators: Record<string, TableGenerator> = {
    RICE: new RICETableGenerator(),
    Budget: new BudgetTableGenerator(),
    RACI: new RACITableGenerator(),
    BSC: new BSCTableGenerator(),
  }

  static generateTable(type: string, context: string, projectData: any): string {
    const generator = this.generators[type]
    if (!generator) {
      throw new Error(`Unknown table type: ${type}`)
    }
    return generator.generateTable(context, projectData)
  }
}
