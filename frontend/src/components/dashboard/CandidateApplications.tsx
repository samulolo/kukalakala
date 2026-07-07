"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Columns3,
  FileText,
  GripVertical,
  List,
  MailCheck,
  MailWarning,
  MessageSquareText,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  UserX,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getAuthToken } from "@/lib/auth/auth-session";
import { DashboardApplication } from "@/lib/dashboard-api";
import { Pagination } from "@/lib/jobs-api";

type Props = {
  applications: DashboardApplication[];
  pagination: Pagination;
  status?: string;
  errorMessage?: string;
};

type DecisionType = "advance" | "reject";
type ViewMode = "list" | "kanban";

const kanbanColumns = [
  { status: "submetida", label: "Submetidas" },
  { status: "em_analise", label: "Em análise" },
  { status: "entrevista", label: "Entrevista" },
  { status: "aprovada", label: "Aprovadas" },
  { status: "rejeitada", label: "Rejeitadas" },
];

const stageStyles: Record<string, string> = {
  submetida: "bg-[#eef6ff] text-[#2557a7]",
  em_analise: "bg-[#effdf4] text-[#16813f]",
  entrevista: "bg-violet-50 text-violet-700",
  aprovada: "bg-[#effdf4] text-[#16813f]",
  rejeitada: "bg-slate-100 text-slate-500",
};

const stageLabels: Record<string, string> = {
  submetida: "Submetida",
  em_analise: "Em análise",
  entrevista: "Entrevista",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

const deliveryLabels: Record<string, string> = {
  sent: "Email enviado",
  failed: "Email falhou",
  not_configured: "Email não configurado",
  simulated: "Registado internamente",
};

const CLIENT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-8 border-[#ccefd9] bg-[#effdf4]">
      <span className="font-display text-[1.55rem] font-semibold text-[#16813f]">{score}</span>
    </div>
  );
}

function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildDecisionMessage(candidate: DashboardApplication, decision: DecisionType) {
  if (decision === "advance") {
    return (
      `Obrigado pela tua candidatura para a vaga de ${candidate.job.title}. ` +
      `Depois de analisarmos o teu currículo e a compatibilidade com os requisitos da vaga, gostaríamos de avançar contigo para a fase de entrevista.\n\n` +
      `Entraremos em contacto para combinar a melhor data e horário.\n\n` +
      `Cumprimentos,\nEquipa ${candidate.job.company}`
    );
  }

  return (
    `Obrigado pela tua candidatura para a vaga de ${candidate.job.title}. ` +
    `Depois de analisarmos o teu currículo e a compatibilidade com os requisitos da vaga, decidimos não avançar para a fase seguinte neste processo.\n\n` +
    `Agradecemos o teu interesse e manteremos o teu perfil em consideração para futuras oportunidades mais alinhadas.\n\n` +
    `Cumprimentos,\nEquipa ${candidate.job.company}`
  );
}

export function CandidateApplications({ applications, pagination, status = "all", errorMessage }: Props) {
  const [localApplications, setLocalApplications] = useState(applications);
  const [selectedCandidate, setSelectedCandidate] = useState<DashboardApplication | null>(null);
  const [decision, setDecision] = useState<DecisionType | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [draggedApplicationId, setDraggedApplicationId] = useState<string | null>(null);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const activeStatus = status && stageLabels[status] ? status : "all";
  const visibleApplications = normalizedSearch
    ? localApplications.filter((application) => {
        const searchable = [
          application.name,
          application.candidateEmail,
          application.role,
          application.job.title,
          application.job.company,
          stageLabels[application.stage] ?? application.stage,
        ].join(" ").toLowerCase();
        return searchable.includes(normalizedSearch);
      })
    : localApplications;
  const totalPages = Math.max(1, pagination.pages || 1);
  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total);
  const stageMetrics = kanbanColumns.map((column) => ({
    ...column,
    count: localApplications.filter((application) => application.stage === column.status).length,
  }));

  useEffect(() => {
    setLocalApplications(applications);
  }, [applications]);

  function closeAnalysis() {
    setSelectedCandidate(null);
    setDecision(null);
    setMessage("");
  }

  function goToPage(nextPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(Math.min(Math.max(nextPage, 1), totalPages)));
    if (activeStatus !== "all") {
      params.set("status", activeStatus);
    }
    router.push(`/dashboard/candidatos?${params.toString()}`);
  }

  function changeStatusFilter(nextStatus: string) {
    const params = new URLSearchParams();
    params.set("page", "1");
    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }
    router.push(`/dashboard/candidatos?${params.toString()}`);
  }

  function prepareDecision(nextDecision: DecisionType, candidate = selectedCandidate) {
    if (!candidate) {
      return;
    }

    setSelectedCandidate(candidate);
    setDecision(nextDecision);
    setMessage(buildDecisionMessage(candidate, nextDecision));
    toast({
      title: nextDecision === "advance" ? "Mensagem de entrevista preparada" : "Mensagem de recusa preparada",
      description: "Revê o texto antes de confirmar a decisão.",
      variant: nextDecision === "advance" ? "success" : "warning",
    });
  }

  async function updateApplicationStage(application: DashboardApplication, nextStage: string, candidateMessage = "") {
    const previousApplications = localApplications;
    setUpdatingApplicationId(application.id);
    setLocalApplications((items) => items.map((item) => item.id === application.id ? { ...item, stage: nextStage } : item));
    setSelectedCandidate((current) => current?.id === application.id ? { ...current, stage: nextStage } : current);

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("missing session");
      }

      const response = await fetch(`${CLIENT_API_BASE_URL}/api/v1/application/${application.id}/company-decision`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: nextStage, message: candidateMessage }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error("update failed");
      }

      const createdMessage = payload?.data?.message;
      if (createdMessage) {
        const normalizedMessage = {
          id: createdMessage.id,
          status: createdMessage.status,
          message: createdMessage.message,
          deliveryStatus: createdMessage.delivery_status,
          createdAt: createdMessage.created_at,
          sentAt: createdMessage.sent_at,
        };
        setLocalApplications((items) => items.map((item) => (
          item.id === application.id
            ? { ...item, stage: nextStage, messages: [normalizedMessage, ...item.messages] }
            : item
        )));
        setSelectedCandidate((current) => current?.id === application.id
          ? { ...current, stage: nextStage, messages: [normalizedMessage, ...current.messages] }
          : current);
      }

      toast({
        title: "Status atualizado",
        description: `${application.name} passou para ${stageLabels[nextStage] ?? nextStage}.`,
        variant: "success",
      });
      router.refresh();
      return true;
    } catch {
      setLocalApplications(previousApplications);
      setSelectedCandidate((current) => current?.id === application.id ? application : current);
      toast({
        title: "Não foi possível atualizar o status",
        description: "Confirma se a API está em execução e tenta novamente.",
        variant: "error",
      });
      return false;
    } finally {
      setUpdatingApplicationId(null);
      setDraggedApplicationId(null);
    }
  }

  async function sendDecisionMessage() {
    if (!selectedCandidate || !decision) {
      return;
    }

    setIsSending(true);

    try {
      const updated = await updateApplicationStage(selectedCandidate, decision === "advance" ? "entrevista" : "rejeitada", message);
      if (updated) {
        setDecision(null);
        setMessage("");
        setSelectedCandidate(null);
      }
    } finally {
      setIsSending(false);
    }
  }

  function handleDrop(nextStage: string) {
    const application = localApplications.find((item) => item.id === draggedApplicationId);

    if (!application || application.stage === nextStage) {
      setDraggedApplicationId(null);
      return;
    }

    updateApplicationStage(application, nextStage);
  }

  function renderKanban() {
    return (
      <div className="mt-5 grid gap-3 xl:grid-cols-5">
        {kanbanColumns.map((column) => {
          const columnApplications = visibleApplications.filter((application) => application.stage === column.status);

          return (
            <section
              key={column.status}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.status)}
              className="min-h-[260px] rounded-xl border border-[#e3e8ef] bg-[#f8fafc] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[0.86rem] font-semibold text-[#0f172a]">{column.label}</h2>
                  <p className="mt-0.5 text-[0.72rem] text-[#94a3b8]">{columnApplications.length} candidatura{columnApplications.length === 1 ? "" : "s"}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[0.72rem] font-semibold ${stageStyles[column.status] ?? "bg-slate-100 text-slate-500"}`}>
                  {stageLabels[column.status]}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {columnApplications.map((candidate) => (
                  <article
                    key={candidate.id}
                    draggable
                    onDragStart={() => setDraggedApplicationId(candidate.id)}
                    onDragEnd={() => setDraggedApplicationId(null)}
                    className={`rounded-xl border border-[#dbe3ee] bg-white p-3 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition ${
                      draggedApplicationId === candidate.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#eef6ff] text-[0.72rem] font-bold text-[#2557a7]">
                        {initials(candidate.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[0.84rem] font-semibold text-[#0f172a]">{candidate.name}</p>
                            <p className="mt-0.5 line-clamp-2 text-[0.74rem] leading-snug text-[#667085]">{candidate.role}</p>
                          </div>
                          <GripVertical className="mt-0.5 flex-shrink-0 text-[#cbd5e1]" size={16} aria-hidden="true" />
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="text-[0.78rem] font-semibold text-accent">{candidate.match}% match</span>
                          <span className="text-[0.72rem] text-[#94a3b8]">{candidate.applied}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 border-t border-[#edf1f6] pt-3">
                      <button
                        onClick={() => setSelectedCandidate(candidate)}
                        className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#0f172a] px-2 text-[0.76rem] font-semibold text-white hover:bg-[#1e293b]"
                      >
                        <Sparkles size={13} aria-hidden="true" />
                        Análise
                      </button>
                      {candidate.stage === "submetida" && (
                        <button
                          onClick={() => updateApplicationStage(candidate, "em_analise")}
                          disabled={updatingApplicationId === candidate.id}
                          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#ccefd9] bg-[#effdf4] px-2 text-[0.76rem] font-semibold text-[#16813f] disabled:opacity-60"
                        >
                          Analisar
                        </button>
                      )}
                      {candidate.stage !== "entrevista" && candidate.stage !== "aprovada" && candidate.stage !== "rejeitada" && (
                        <button
                          onClick={() => prepareDecision("advance", candidate)}
                          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#ccefd9] bg-white px-2 text-[0.76rem] font-semibold text-[#16813f]"
                        >
                          Entrevista
                        </button>
                      )}
                      {candidate.stage !== "rejeitada" && (
                        <button
                          onClick={() => prepareDecision("reject", candidate)}
                          className="inline-flex min-h-9 items-center justify-center rounded-lg border border-[#fecaca] bg-white px-2 text-[0.76rem] font-semibold text-[#b91c1c]"
                        >
                          Recusar
                        </button>
                      )}
                      <select
                        aria-label={`Alterar status de ${candidate.name}`}
                        className="min-h-9 rounded-lg border border-[#dbe3ee] bg-white px-2 text-[0.76rem] font-semibold text-[#475569] outline-none focus:border-accent"
                        value={candidate.stage}
                        disabled={updatingApplicationId === candidate.id}
                        onChange={(event) => updateApplicationStage(candidate, event.target.value)}
                      >
                        {kanbanColumns.map((item) => (
                          <option key={item.status} value={item.status}>{stageLabels[item.status]}</option>
                        ))}
                      </select>
                    </div>
                  </article>
                ))}

                {columnApplications.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-white/60 px-3 py-8 text-center">
                    <p className="text-[0.78rem] font-medium text-[#94a3b8]">Sem candidatos nesta etapa</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              className="min-h-10 w-full rounded-lg border border-[#dbe3ee] bg-[#f8fafc] pl-9 pr-3 text-[0.88rem] outline-none focus:border-accent focus:bg-white"
              placeholder="Pesquisar candidatos"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="inline-flex rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-1">
              <button
                onClick={() => setViewMode("kanban")}
                className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[0.8rem] font-semibold ${
                  viewMode === "kanban" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#667085]"
                }`}
              >
                <Columns3 size={14} aria-hidden="true" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md px-3 text-[0.8rem] font-semibold ${
                  viewMode === "list" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#667085]"
                }`}
              >
                <List size={14} aria-hidden="true" />
                Lista
              </button>
            </div>
            <label className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[0.82rem] font-semibold text-[#475569]">
              <SlidersHorizontal size={15} aria-hidden="true" />
              <select
                aria-label="Filtrar candidatos por etapa"
                className="bg-transparent text-[0.82rem] font-semibold text-[#475569] outline-none"
                value={activeStatus}
                onChange={(event) => changeStatusFilter(event.target.value)}
              >
                <option value="all">Todas as etapas</option>
                {kanbanColumns.map((column) => (
                  <option key={column.status} value={column.status}>{column.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {stageMetrics.map((item) => (
            <button
              key={item.status}
              onClick={() => changeStatusFilter(item.status)}
              className={`flex min-h-[68px] items-center justify-between rounded-xl border px-3 text-left transition ${
                activeStatus === item.status
                  ? "border-[#0f172a] bg-[#0f172a] text-white"
                  : "border-[#e3e8ef] bg-[#f8fafc] text-[#0f172a] hover:border-[#cbd5e1]"
              }`}
            >
              <span>
                <span className={`block text-[0.74rem] font-semibold ${activeStatus === item.status ? "text-white/70" : "text-[#94a3b8]"}`}>
                  {item.label}
                </span>
                <span className="mt-1 block text-[1.25rem] font-semibold">{item.count}</span>
              </span>
              <span className={`rounded-full px-2 py-1 text-[0.72rem] font-semibold ${
                activeStatus === item.status ? "bg-white/10 text-white" : stageStyles[item.status]
              }`}>
                {stageLabels[item.status]}
              </span>
            </button>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[0.85rem] font-medium text-[#b91c1c]">
            {errorMessage}
          </div>
        )}

        {viewMode === "kanban" ? renderKanban() : (
          <div className="mt-5 divide-y divide-[#f1f5f9]">
            {visibleApplications.map((candidate) => (
              <div key={candidate.id} className="grid gap-3 py-4 lg:grid-cols-[minmax(0,1fr)_120px_120px_92px_132px] lg:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[0.78rem] font-bold text-[#2557a7]">
                    {initials(candidate.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[0.9rem] font-semibold text-[#0f172a]">{candidate.name}</p>
                    <p className="mt-0.5 truncate text-[0.78rem] text-[#94a3b8]">{candidate.role}</p>
                  </div>
                </div>
                <span className="text-[0.86rem] font-semibold text-accent">{candidate.match}% match</span>
                <span className={`w-fit rounded-full px-2.5 py-1 text-[0.78rem] font-semibold ${stageStyles[candidate.stage] ?? "bg-slate-100 text-slate-500"}`}>
                  {stageLabels[candidate.stage] ?? candidate.stage}
                </span>
                <span className="text-[0.78rem] font-medium text-[#94a3b8] lg:text-right">{candidate.applied}</span>
                <button
                  onClick={() => setSelectedCandidate(candidate)}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-3 text-[0.8rem] font-semibold text-white hover:bg-[#1e293b]"
                >
                  <Sparkles size={15} aria-hidden="true" />
                  Ver análise
                </button>
              </div>
            ))}
          </div>
        )}

        {visibleApplications.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-[0.95rem] font-semibold text-[#0f172a]">
              {localApplications.length === 0 ? "Nenhuma candidatura encontrada" : "Nenhum candidato corresponde à pesquisa"}
            </p>
            <p className="mt-1 text-[0.85rem] text-[#667085]">
              {localApplications.length === 0 ? "Quando houver aplicações reais na API, elas aparecem aqui." : "Tenta pesquisar por nome, email, vaga ou etapa."}
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-[#edf1f6] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.82rem] text-[#667085]">
            Mostrando {firstItem}-{lastItem} de {pagination.total} candidatos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Página anterior de candidatos"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={`h-9 min-w-9 rounded-lg px-3 text-[0.82rem] font-semibold ${
                  pageNumber === pagination.page ? "bg-[#0f172a] text-white" : "border border-[#dbe3ee] bg-white text-[#475569]"
                }`}
              >
                {pageNumber}
              </button>
            ))}
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Próxima página de candidatos"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 p-4">
          <div className="max-h-[calc(100svh-32px)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#edf1f6] bg-white p-5">
              <div>
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
                  Análise da candidatura
                </p>
                <h2 className="mt-1 font-display text-[1.35rem] font-semibold text-[#0f172a]">
                  {selectedCandidate.name}
                </h2>
                <p className="mt-1 text-[0.88rem] text-[#667085]">
                  Aplicou para {selectedCandidate.job.title}
                </p>
              </div>
              <button
                onClick={closeAnalysis}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] hover:border-accent hover:text-accent"
                aria-label="Fechar análise"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_280px]">
              <section className="space-y-5">
                <div className="rounded-2xl border border-[#e3e8ef] p-5">
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness size={18} className="text-accent" aria-hidden="true" />
                    <h3 className="font-display text-[1rem] font-semibold text-[#0f172a]">Detalhes da vaga</h3>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-[#f8fafc] p-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Vaga</p>
                      <p className="mt-1 text-[0.9rem] font-semibold text-[#0f172a]">{selectedCandidate.job.title}</p>
                    </div>
                    <div className="rounded-xl bg-[#f8fafc] p-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Empresa</p>
                      <p className="mt-1 text-[0.9rem] font-semibold text-[#0f172a]">{selectedCandidate.job.company}</p>
                    </div>
                    <div className="rounded-xl bg-[#f8fafc] p-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Modalidade</p>
                      <p className="mt-1 text-[0.9rem] font-semibold text-[#0f172a]">{selectedCandidate.job.type}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-[0.9rem] leading-[1.7] text-[#475569]">{selectedCandidate.job.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedCandidate.job.requirements.map((requirement) => (
                      <span key={requirement} className="rounded-full border border-[#dbe3ee] bg-[#f8fafc] px-3 py-1 text-[0.78rem] font-semibold text-[#475569]">
                        {requirement}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e3e8ef] p-5">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-accent" aria-hidden="true" />
                    <h3 className="font-display text-[1rem] font-semibold text-[#0f172a]">Comparação com o CV</h3>
                  </div>
                  <p className="mt-3 text-[0.9rem] leading-[1.7] text-[#475569]">{selectedCandidate.cv.headline}</p>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Competências identificadas</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedCandidate.cv.competences.length > 0 ? selectedCandidate.cv.competences.map((competence) => (
                          <span key={competence} className="rounded-full bg-[#effdf4] px-3 py-1 text-[0.78rem] font-semibold text-[#16813f]">
                            {competence}
                          </span>
                        )) : (
                          <span className="text-[0.86rem] text-[#667085]">Sem competências registadas no perfil.</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Lacunas</p>
                      <ul className="mt-3 space-y-2">
                        {selectedCandidate.cv.gaps.length > 0 ? selectedCandidate.cv.gaps.map((gap) => (
                          <li key={gap} className="text-[0.86rem] leading-relaxed text-[#667085]">{gap}</li>
                        )) : (
                          <li className="text-[0.86rem] leading-relaxed text-[#667085]">Sem lacunas claras identificadas pelos dados disponíveis.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-[#f8fafc] p-4">
                    <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Pontos de aderência</p>
                    <ul className="mt-3 space-y-2">
                      {selectedCandidate.cv.matched.length > 0 ? selectedCandidate.cv.matched.map((item) => (
                        <li key={item} className="flex gap-2 text-[0.88rem] leading-relaxed text-[#475569]">
                          <CheckCircle2 className="mt-0.5 flex-shrink-0 text-accent" size={16} aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      )) : (
                        <li className="text-[0.88rem] leading-relaxed text-[#475569]">A IA ainda não devolveu competências chave para esta candidatura.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </section>

              <aside className="self-start rounded-2xl border border-[#ccefd9] bg-[#fbfffc] p-5">
                <div className="flex items-center gap-4">
                  <ScoreRing score={selectedCandidate.ai.score} />
                  <div>
                    <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#16813f]">Score IA</p>
                    <p className="mt-1 text-[0.88rem] text-[#667085]">Compatibilidade com a vaga</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-[#ccefd9] pt-5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={17} className="text-accent" aria-hidden="true" />
                    <h3 className="font-display text-[1rem] font-semibold text-[#0f172a]">Explicação da IA</h3>
                  </div>
                  <p className="mt-3 text-[0.9rem] leading-[1.75] text-[#475569]">
                    {selectedCandidate.ai.explanation}
                  </p>
                </div>
                <div className="mt-5 border-t border-[#ccefd9] pt-5">
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">
                    Decisão
                  </p>
                  <div className="mt-3 grid gap-2">
                    <button
                      onClick={() => prepareDecision("advance")}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.86rem] font-semibold text-white hover:bg-accent-dark"
                    >
                      <CalendarCheck size={16} aria-hidden="true" />
                      Avançar com entrevista
                    </button>
                    <button
                      onClick={() => prepareDecision("reject")}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#fecaca] bg-white px-4 text-[0.86rem] font-semibold text-[#b91c1c] hover:bg-[#fff1f2]"
                    >
                      <UserX size={16} aria-hidden="true" />
                      Não avançar
                    </button>
                  </div>
                </div>
                <div className="mt-5 border-t border-[#ccefd9] pt-5">
                  <div className="flex items-center gap-2">
                    <MessageSquareText size={17} className="text-accent" aria-hidden="true" />
                    <h3 className="font-display text-[1rem] font-semibold text-[#0f172a]">Histórico</h3>
                  </div>
                  <div className="mt-3 space-y-3">
                    {selectedCandidate.messages.length > 0 ? selectedCandidate.messages.map((item) => (
                      <div key={item.id} className="rounded-xl border border-[#dbe3ee] bg-white p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${stageStyles[item.status] ?? "bg-slate-100 text-slate-500"}`}>
                            {stageLabels[item.status] ?? item.status}
                          </span>
                          <span className="text-[0.72rem] text-[#94a3b8]">{formatMessageDate(item.createdAt)}</span>
                        </div>
                        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.7rem] font-semibold ${
                          item.deliveryStatus === "sent" ? "bg-[#effdf4] text-[#16813f]" : "bg-[#fff7ed] text-orange-700"
                        }`}>
                          {item.deliveryStatus === "sent" ? <MailCheck size={13} aria-hidden="true" /> : <MailWarning size={13} aria-hidden="true" />}
                          {deliveryLabels[item.deliveryStatus] ?? item.deliveryStatus}
                        </div>
                        <p className="mt-2 whitespace-pre-line text-[0.82rem] leading-relaxed text-[#475569]">{item.message}</p>
                      </div>
                    )) : (
                      <p className="text-[0.84rem] leading-relaxed text-[#667085]">Ainda não há mensagens registadas para este candidato.</p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}

      {selectedCandidate && decision && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f172a]/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.32)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#edf1f6] p-5">
              <div>
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
                  Mensagem ao candidato
                </p>
                <h3 className="mt-1 font-display text-[1.2rem] font-semibold text-[#0f172a]">
                  {decision === "advance" ? "Avançar para entrevista" : "Não avançar candidatura"}
                </h3>
                <p className="mt-1 text-[0.86rem] text-[#667085]">
                  Esta mensagem será enviada para {selectedCandidate.name}{selectedCandidate.candidateEmail ? ` (${selectedCandidate.candidateEmail})` : ""}.
                </p>
              </div>
              <button
                onClick={() => setDecision(null)}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] hover:border-accent hover:text-accent"
                aria-label="Fechar mensagem"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              <textarea
                className="min-h-[260px] w-full resize-none rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-4 text-[0.9rem] leading-[1.7] text-[#334155] outline-none focus:border-accent focus:bg-white"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
              />

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={() => setDecision(null)}
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#dbe3ee] bg-white px-4 text-[0.86rem] font-semibold text-[#475569] hover:border-[#bfd0e5]"
                >
                  Rever análise
                </button>
                <button
                  onClick={sendDecisionMessage}
                  disabled={isSending}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-[0.86rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                    decision === "advance" ? "bg-accent hover:bg-accent-dark" : "bg-[#b91c1c] hover:bg-[#991b1b]"
                  }`}
                >
                  <Send size={16} aria-hidden="true" />
                  {isSending ? "A registar..." : "Enviar mensagem"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
