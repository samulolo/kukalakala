export const stats = [
  {
    value: "PDF",
    label: "Currículo guardado e legível para análise",
  },
  {
    value: "Status",
    label: "Candidaturas acompanhadas sem planilhas soltas",
  },
  {
    value: "Filtros",
    label: "Pesquisa por tipo, empresa e competências",
  },
];

export const popularSearches = ["Backend", "Remoto", "Atendimento", "Operações"];

export const jobs = [
  {
    company: "Kukalakala",
    type: "Presencial",
    title: "Desenvolvedor Fullstack",
    description:
      "APIs, interfaces e integrações para produtos digitais com foco em velocidade e qualidade.",
    tags: ["Python", "JavaScript", "PostgreSQL"],
  },
  {
    company: "Talento & Operações",
    type: "Híbrido",
    title: "Analista de Recrutamento",
    description:
      "Gestão de pipeline, entrevistas e acompanhamento de candidatos em ciclos de seleção.",
    tags: ["Triagem", "Entrevistas", "People Ops"],
  },
  {
    company: "Produto Digital",
    type: "Remoto",
    title: "Designer de Produto",
    description:
      "Pesquisa, prototipagem e desenho de experiências para fluxos de candidatura e dashboard.",
    tags: ["UX", "UI", "Pesquisa"],
  },
];

export const steps = [
  {
    title: "Candidato cria o perfil",
    description:
      "Dados profissionais, competências e situação atual ficam organizados numa base limpa.",
  },
  {
    title: "Currículo é enviado e processado",
    description:
      "O PDF fica armazenado no Supabase e o texto extraído fica disponível para análise futura.",
  },
  {
    title: "Empresa acompanha candidaturas",
    description:
      "Status, filtros e respostas padronizadas ajudam a manter o processo previsível.",
  },
];

export const pipeline = [
  {
    title: "Submetidas",
    candidates: ["Backend API | Python, FastAPI, SQL", "Produto digital | UX, Pesquisa, Métricas"],
  },
  {
    title: "Em análise",
    candidates: ["Fullstack | React, APIs, Dados"],
  },
  {
    title: "Entrevista",
    candidates: ["Operações | Atendimento, Processos"],
  },
  {
    title: "Aprovadas",
    candidates: ["Frontend | UI, Design System"],
  },
];
