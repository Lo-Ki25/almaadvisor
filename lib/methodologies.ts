// Methodology definitions and templates for ALMA-ADVISOR

import type { Methodology } from "./types"

export const METHODOLOGIES: Methodology[] = [
  {
    id: "togaf",
    name: "TOGAF",
    description: "The Open Group Architecture Framework for enterprise architecture",
    framework: "Enterprise Architecture",
    applicableSections: [10, 11, 15],
    templates: [
      {
        id: "togaf-adm",
        name: "Architecture Development Method",
        type: "framework",
        content: "TOGAF ADM phases and deliverables template",
        variables: [
          {
            name: "phase",
            type: "select",
            required: true,
            options: ["Preliminary", "A", "B", "C", "D", "E", "F", "G", "H"],
          },
          {
            name: "stakeholders",
            type: "multiselect",
            required: true,
            options: ["Business", "IT", "Security", "Compliance"],
          },
        ],
      },
    ],
  },
  {
    id: "c4-model",
    name: "C4 Model",
    description: "Context, Containers, Components, and Code architecture diagrams",
    framework: "Software Architecture",
    applicableSections: [10],
    templates: [
      {
        id: "c4-context",
        name: "System Context Diagram",
        type: "diagram",
        content: "C4 Level 1 - System Context",
        variables: [
          { name: "systemName", type: "text", required: true },
          { name: "externalSystems", type: "multiselect", required: false },
        ],
      },
    ],
  },
  {
    id: "bpmn",
    name: "BPMN 2.0",
    description: "Business Process Model and Notation for process modeling",
    framework: "Process Management",
    applicableSections: [11],
    templates: [
      {
        id: "bpmn-process",
        name: "Business Process Diagram",
        type: "diagram",
        content: "BPMN 2.0 process flow template",
        variables: [
          { name: "processName", type: "text", required: true },
          { name: "swimlanes", type: "multiselect", required: false },
        ],
      },
    ],
  },
  {
    id: "business-model-canvas",
    name: "Business Model Canvas",
    description: "Strategic management template for business model development",
    framework: "Business Strategy",
    applicableSections: [9],
    templates: [
      {
        id: "canvas-template",
        name: "Business Model Canvas",
        type: "framework",
        content: "9-block business model canvas",
        variables: [
          { name: "valueProposition", type: "text", required: true },
          { name: "customerSegments", type: "multiselect", required: true },
        ],
      },
    ],
  },
]

export const COMPLIANCE_FRAMEWORKS = [
  {
    id: "gdpr",
    name: "GDPR",
    description: "General Data Protection Regulation compliance",
    applicableSections: [12],
    requirements: [
      "Data Protection Impact Assessment",
      "Privacy by Design",
      "Data Subject Rights",
      "Consent Management",
    ],
  },
  {
    id: "owasp",
    name: "OWASP",
    description: "Open Web Application Security Project guidelines",
    applicableSections: [12],
    requirements: ["Top 10 Security Risks", "Security Testing", "Secure Coding Practices", "Threat Modeling"],
  },
  {
    id: "wcag",
    name: "WCAG 2.2",
    description: "Web Content Accessibility Guidelines",
    applicableSections: [12],
    requirements: ["Perceivable Content", "Operable Interface", "Understandable Information", "Robust Implementation"],
  },
]
