"use client";

import { BriefcaseBusiness, Search } from "lucide-react";

function SearchForm() {
  return (
    <form
      className="mt-8 flex w-full max-w-[780px] flex-col gap-2 rounded-2xl border border-[#dbe3ee] bg-white p-2 shadow-[0_8px_40px_rgba(15,23,42,0.08)] sm:mt-10 md:flex-row md:items-center md:gap-0 md:overflow-hidden"
      action="/vagas"
    >
      <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#f8fafc] px-3 text-[#94a3b8] focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/10 md:min-h-0 md:rounded-none md:bg-white md:px-5" aria-label="Cargo ou empresa">
        <Search size={18} className="shrink-0" aria-hidden="true" />
        <input
          type="search"
          name="q"
          placeholder="Cargo, competência ou empresa"
          className="h-12 w-full min-w-0 border-0 bg-transparent text-[0.92rem] font-medium text-[#111827] outline-none placeholder:text-[#94a3b8] md:h-[60px]"
        />
      </label>

      <div className="hidden h-7 w-px shrink-0 bg-[#e2e8f0] md:block" aria-hidden="true" />

      <label className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl bg-[#f8fafc] px-3 text-[#94a3b8] focus-within:bg-white focus-within:ring-2 focus-within:ring-accent/10 md:min-h-0 md:flex-[0.7] md:rounded-none md:bg-white md:px-5" aria-label="Modalidade de trabalho">
        <BriefcaseBusiness size={18} className="shrink-0" aria-hidden="true" />
        <select
          name="type"
          defaultValue="all"
          className="h-12 w-full min-w-0 border-0 bg-transparent text-[0.92rem] font-medium text-[#111827] outline-none md:h-[60px]"
        >
          <option value="all">Todas modalidades</option>
          <option value="remote">Remoto</option>
          <option value="hybrid">Híbrido</option>
          <option value="on_site">Presencial</option>
        </select>
      </label>

      <div className="md:p-2">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center whitespace-nowrap rounded-[14px] bg-accent px-7 text-[0.92rem] font-bold text-white transition-colors hover:bg-accent-dark md:h-[48px] md:w-auto"
        >
          Pesquisar vagas
        </button>
      </div>
    </form>
  );
}

export default SearchForm;
