import { MapPin, Search } from "lucide-react";

type SearchPanelProps = {
  buttonLabel?: string;
  buttonClassName?: string;
};

const defaultButtonClassName =
  "inline-flex min-h-[64px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-[16px] bg-accent px-8 font-display text-[1rem] font-bold text-white hover:bg-accent-dark md:w-auto";

export function SearchPanel({ buttonLabel = "Pesquisar", buttonClassName = defaultButtonClassName }: SearchPanelProps) {
  return (
    <form
      className="grid w-full grid-cols-1 gap-2.5 rounded-[20px] border border-[#dbe3ee] bg-white p-2 shadow-[0_22px_55px_rgba(15,23,42,0.08)] md:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.75fr)_auto] md:gap-0"
      action="/vagas"
    >
      <label
        className="inline-flex h-[64px] min-w-0 items-center gap-4 rounded-[16px] border border-transparent bg-white px-5 text-[#93a2b5] focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(37,87,167,0.12)]"
        aria-label="Pesquisar vaga"
      >
        <Search size={20} aria-hidden="true" />
        <input
          className="w-full min-w-0 border-0 bg-transparent text-[1.08rem] font-medium text-ink outline-0 placeholder:text-[#8b98aa]"
          name="q"
          type="search"
          placeholder="Cargo, palavra-chave ou empresa"
        />
      </label>
      <label
        className="inline-flex h-[64px] min-w-0 items-center gap-4 rounded-[16px] border border-transparent bg-white px-5 text-[#93a2b5] focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(37,87,167,0.12)] md:rounded-none md:border-l md:border-[#dbe3ee]"
        aria-label="Localização ou tipo"
      >
        <MapPin size={20} aria-hidden="true" />
        <select className="w-full min-w-0 border-0 bg-transparent text-[1.08rem] font-medium text-[#8b98aa] outline-0" name="type" defaultValue="all">
          <option value="all">Localização ou tipo</option>
          <option value="remote">Remoto</option>
          <option value="hybrid">Híbrido</option>
          <option value="on_site">Presencial</option>
        </select>
      </label>
      <button
        className={buttonClassName}
        type="submit"
      >
        {buttonLabel}
      </button>
    </form>
  );
}
