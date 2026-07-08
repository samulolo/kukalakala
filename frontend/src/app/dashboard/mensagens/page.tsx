import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Mail,
  MessageSquareText,
  Search,
  Send,
} from "lucide-react";
import { DashboardApplication, getDashboardApplications } from "@/lib/dashboard-api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

const statusLabels: Record<string, string> = {
  submetida: "Submetida",
  em_analise: "Em análise",
  entrevista: "Entrevista",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

const statusStyles: Record<string, string> = {
  submetida: "bg-[#eef6ff] text-[#2557a7]",
  em_analise: "bg-[#effdf4] text-[#16813f]",
  entrevista: "bg-violet-50 text-violet-700",
  aprovada: "bg-[#effdf4] text-[#16813f]",
  rejeitada: "bg-slate-100 text-slate-500",
};

const feedbackStatuses = new Set(["em_analise", "entrevista", "aprovada", "rejeitada"]);

function getStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getFeedbackSummary(application: DashboardApplication) {
  const latestMessage = application.messages[0];

  if (latestMessage) {
    return latestMessage.message;
  }

  if (application.stage === "entrevista") {
    return "A candidatura avançou para entrevista.";
  }

  if (application.stage === "aprovada") {
    return "A candidatura foi aprovada.";
  }

  if (application.stage === "rejeitada") {
    return "A candidatura não avançou neste processo.";
  }

  if (application.stage === "em_analise") {
    return "A candidatura está em análise pela empresa.";
  }

  return "Ainda sem feedback enviado.";
}

function hasFeedback(application: DashboardApplication) {
  return application.messages.length > 0 || feedbackStatuses.has(application.stage);
}

function matchesSearch(application: DashboardApplication, search: string) {
  if (!search) {
    return true;
  }

  const content = [
    application.name,
    application.candidateEmail,
    application.job.title,
    application.job.company,
    getStatusLabel(application.stage),
    getFeedbackSummary(application),
  ].join(" ").toLowerCase();

  return content.includes(search);
}

export default async function DashboardMessagesPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = params?.q?.trim().toLowerCase() ?? "";
  const cookieStore = await cookies();
  const authToken = cookieStore.get("kukalakala_session")?.value;
  const applicationsData = await getDashboardApplications({ page: "1", limit: "100", authToken });
  const feedbackApplications = applicationsData.items
    .filter(hasFeedback)
    .filter((application) => matchesSearch(application, search));
  const activeApplication = feedbackApplications[0] ?? null;

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-[1.65rem] font-semibold text-[#0f172a]">Mensagens</h1>
        <p className="mt-1 text-[0.9rem] text-[#667085]">
          Acompanha candidatos que receberam feedback sobre as suas candidaturas.
        </p>
      </div>

      {applicationsData.errorMessage && (
        <div className="rounded-lg border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[0.85rem] font-medium text-[#b91c1c]">
          {applicationsData.errorMessage}
        </div>
      )}

      <section className="grid min-h-[620px] min-w-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-xl border border-[#e3e8ef] bg-white p-4 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <form className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input
              name="q"
              defaultValue={params?.q ?? ""}
              className="min-h-10 w-full rounded-lg border border-[#dbe3ee] bg-[#f8fafc] pl-9 pr-3 text-[0.88rem] outline-none focus:border-accent focus:bg-white"
              placeholder="Pesquisar por candidato, vaga ou estado"
            />
          </form>

          <div className="mt-4 flex flex-col gap-2">
            {feedbackApplications.map((application) => {
              const latestMessage = application.messages[0];
              const isActive = activeApplication?.id === application.id;

              return (
                <Link
                  key={application.id}
                  href={`/dashboard/candidatos?page=1`}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    isActive ? "border-[#ccefd9] bg-[#effdf4]" : "border-transparent hover:bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-[0.88rem] font-semibold text-[#0f172a]">{application.name}</p>
                    <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${statusStyles[application.stage] ?? "bg-slate-100 text-slate-500"}`}>
                      {getStatusLabel(application.stage)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[0.78rem] font-semibold text-[#475569]">{application.job.title}</p>
                  <p className="mt-1 line-clamp-2 text-[0.78rem] leading-snug text-[#94a3b8]">
                    {latestMessage ? latestMessage.message : getFeedbackSummary(application)}
                  </p>
                </Link>
              );
            })}

            {feedbackApplications.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#dbe3ee] bg-[#f8fafc] p-5 text-center">
                <MessageSquareText className="mx-auto text-[#94a3b8]" size={22} aria-hidden="true" />
                <p className="mt-3 text-[0.9rem] font-semibold text-[#0f172a]">Sem feedback encontrado</p>
                <p className="mt-1 text-[0.82rem] leading-relaxed text-[#667085]">
                  Assim que uma candidatura avançar, for rejeitada, aprovada ou receber uma mensagem, aparece aqui.
                </p>
              </div>
            )}
          </div>
        </aside>

        <article className="flex min-w-0 flex-col rounded-xl border border-[#e3e8ef] bg-white shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          {activeApplication ? (
            <>
              <div className="border-b border-[#edf1f6] p-5">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Candidato com feedback</p>
                <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-display text-[1.25rem] font-semibold text-[#0f172a]">{activeApplication.name}</h2>
                    <p className="mt-1 truncate text-[0.88rem] text-[#667085]">{activeApplication.candidateEmail || "Email não informado"}</p>
                  </div>
                  <span className={`w-fit rounded-full px-3 py-1 text-[0.78rem] font-semibold ${statusStyles[activeApplication.stage] ?? "bg-slate-100 text-slate-500"}`}>
                    {getStatusLabel(activeApplication.stage)}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 border-b border-[#edf1f6] p-5 md:grid-cols-3">
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <BriefcaseBusiness size={18} className="text-accent" aria-hidden="true" />
                  <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Vaga</p>
                  <p className="mt-1 text-[0.9rem] font-semibold text-[#0f172a]">{activeApplication.job.title}</p>
                </div>
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <CheckCircle2 size={18} className="text-accent" aria-hidden="true" />
                  <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Score IA</p>
                  <p className="mt-1 text-[0.9rem] font-semibold text-[#0f172a]">{activeApplication.match}%</p>
                </div>
                <div className="rounded-xl bg-[#f8fafc] p-4">
                  <Mail size={18} className="text-accent" aria-hidden="true" />
                  <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Feedbacks</p>
                  <p className="mt-1 text-[0.9rem] font-semibold text-[#0f172a]">{Math.max(activeApplication.messages.length, 1)}</p>
                </div>
              </div>

              <div className="flex-1 space-y-4 p-5">
                {activeApplication.messages.length > 0 ? activeApplication.messages.map((message) => (
                  <div key={message.id} className="max-w-[920px] rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[0.74rem] font-semibold ${statusStyles[message.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {getStatusLabel(message.status)}
                      </span>
                      <span className="text-[0.76rem] text-[#94a3b8]">{formatMessageDate(message.createdAt)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-[0.9rem] leading-relaxed text-[#475569]">{message.message}</p>
                  </div>
                )) : (
                  <div className="max-w-[760px] rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[0.74rem] font-semibold ${statusStyles[activeApplication.stage] ?? "bg-slate-100 text-slate-500"}`}>
                        {getStatusLabel(activeApplication.stage)}
                      </span>
                      <span className="text-[0.76rem] text-[#94a3b8]">{activeApplication.applied}</span>
                    </div>
                    <p className="mt-3 text-[0.9rem] leading-relaxed text-[#475569]">{getFeedbackSummary(activeApplication)}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#edf1f6] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[0.82rem] leading-relaxed text-[#667085]">
                    Para enviar novo feedback, abre a candidatura e usa a ação de decisão.
                  </p>
                  <Link
                    href="/dashboard/candidatos"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-4 text-[0.84rem] font-semibold text-white hover:bg-[#1e293b]"
                  >
                    Abrir candidatos
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#effdf4] text-accent">
                <Send size={21} aria-hidden="true" />
              </div>
              <h2 className="mt-4 font-display text-[1.15rem] font-semibold text-[#0f172a]">Ainda não há mensagens reais</h2>
              <p className="mt-2 max-w-md text-[0.9rem] leading-relaxed text-[#667085]">
                Quando a empresa avançar, rejeitar, aprovar ou enviar feedback a um candidato, a conversa aparece nesta rota.
              </p>
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
