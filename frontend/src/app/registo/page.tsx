"use client";

import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Building2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-api";
import { saveAuthSession } from "@/lib/auth/auth-session";
import { getSafeRedirectPath } from "@/lib/auth/auth-redirect";
import { verifyPassword } from "@/utils/util";

export default function RegisterPage() {
  const router = useRouter();
  const { register, registerCompany } = useAuth();
  const [show, setShow] = useState(false);
  const [type, setType] = useState<"candidate" | "company">("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [foundationDate, setFoundationDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("Preenche nome, email e palavra-passe para criar a conta.");
      return;
    }

    if (type === "company" && (!sector.trim() || !location.trim())) {
      setErrorMessage("Preenche setor e localização para criar a conta da empresa.");
      return;
    }

    if (!verifyPassword(password)) {
      setErrorMessage("A palavra-passe deve ter pelo menos 8 caracteres, 1 letra maiuscula, 1 letra minuscula, 1 número e 1 caractere especial dessa lista [@*#$%&]");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = type === "company"
        ? await registerCompany({
            name,
            email,
            password,
            sector,
            location,
            foundation_date: foundationDate || null,
          })
        : await register({ name, email, password });
      saveAuthSession(response.data, type);
      setSuccessMessage("Conta criada com sucesso. A abrir a tua dashboard...");
      const redirectTo = new URLSearchParams(window.location.search).get("redirect");
      router.replace(getSafeRedirectPath(response.data, redirectTo, type));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível criar a conta";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f6f8] px-4 py-12">
 
      <a href="/" className="mb-8 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-[0.72rem] font-black text-white">
          K
        </span>
        <span className="font-display text-[0.95rem] font-bold tracking-tight text-[#0f172a]">
          kukalakala<span className="text-accent">.</span>
        </span>
      </a>

      <div className="w-full max-w-[420px] rounded-2xl border border-[#e4e7ec] bg-white p-8 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
        <h1 className="font-display text-[1.45rem] font-bold tracking-tight text-[#0f172a]">
          Criar conta
        </h1>
        <p className="mt-1 text-[0.85rem] text-[#6b7280]">
          Já tens conta?{" "}
          <Link href="/login" className="font-medium text-accent hover:opacity-80">
            Entrar
          </Link>
        </p>

        {/* Social buttons */}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e7ec] bg-white text-[0.82rem] font-medium text-[#374151] transition hover:bg-[#f9fafb]"
          >
            <svg className="h-[15px] w-[15px] shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            className="flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e4e7ec] bg-white text-[0.82rem] font-medium text-[#374151] transition hover:bg-[#f9fafb]"
          >
            <svg className="h-[15px] w-[15px] shrink-0" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e4e7ec]" />
          <span className="text-[0.73rem] text-[#9ca3af]">ou continua com email</span>
          <div className="h-px flex-1 bg-[#e4e7ec]" />
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleRegister}>
          {/* Account type */}
          <div className="flex rounded-xl bg-[#f5f6f8] p-1">
            {(["candidate", "company"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={type === t}
                onClick={() => {
                  setType(t);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`flex-1 rounded-lg py-2 text-[0.82rem] font-semibold transition-all ${
                  type === t
                    ? "bg-accent text-white shadow-sm"
                    : "text-[#667085] hover:bg-white hover:text-[#0f172a]"
                }`}
              >
                {t === "candidate" ? "Candidato" : "Empresa"}
              </button>
            ))}
          </div>

          {type === "company" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sector" className="text-[0.8rem] font-medium text-[#374151]">
                  Setor
                </label>
                <input
                  id="sector"
                  type="text"
                  value={sector}
                  onChange={(event) => setSector(event.target.value)}
                  placeholder="Tecnologia"
                  className="h-10 w-full rounded-xl border border-[#e4e7ec] px-3.5 text-[0.9rem] text-[#0f172a] outline-none transition placeholder:text-[#c0c7d0] focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="location" className="text-[0.8rem] font-medium text-[#374151]">
                  Localização
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Luanda"
                  className="h-10 w-full rounded-xl border border-[#e4e7ec] px-3.5 text-[0.9rem] text-[#0f172a] outline-none transition placeholder:text-[#c0c7d0] focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="foundation_date" className="text-[0.8rem] font-medium text-[#374151]">
                  Data de fundação
                </label>
                <input
                  id="foundation_date"
                  type="date"
                  value={foundationDate}
                  onChange={(event) => setFoundationDate(event.target.value)}
                  className="h-10 w-full rounded-xl border border-[#e4e7ec] px-3.5 text-[0.9rem] text-[#0f172a] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-[0.8rem] font-medium text-[#374151]">
              {type === "candidate" ? "Nome completo" : "Nome da empresa"}
            </label>
            <div className="relative">
              {type === "candidate"
                ? <User size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c7d0]" />
                : <Building2 size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c7d0]" />
              }
              <input
                id="name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder={type === "candidate" ? "Ana Silva" : "Empresa Lda."}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#e4e7ec] pl-9 pr-3.5 text-[0.9rem] text-[#0f172a] outline-none transition placeholder:text-[#c0c7d0] focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[0.8rem] font-medium text-[#374151]">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c7d0]" />
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="nome@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#e4e7ec] pl-9 pr-3.5 text-[0.9rem] text-[#0f172a] outline-none transition placeholder:text-[#c0c7d0] focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[0.8rem] font-medium text-[#374151]">
              Palavra-passe
            </label>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c7d0]" />
              <input
                id="password"
                type={show ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 w-full rounded-xl border border-[#e4e7ec] pl-9 pr-10 text-[0.9rem] text-[#0f172a] outline-none transition placeholder:text-[#c0c7d0] focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0c7d0] transition hover:text-[#6b7280]"
                aria-label={show ? "Esconder" : "Mostrar"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-[0.78rem] font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[0.78rem] font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-10 w-full rounded-xl bg-accent text-[0.88rem] font-semibold text-white transition hover:bg-accent-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "A criar conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-4 text-[0.72rem] text-[#9ca3af]">
          Ao criares conta aceitas os{" "}
          <a href="#" className="underline underline-offset-2 hover:text-[#6b7280]">Termos</a>
          {" "}e a{" "}
          <a href="#" className="underline underline-offset-2 hover:text-[#6b7280]">Privacidade</a>.
        </p>
      </div>

      <p className="mt-6 text-[0.72rem] text-[#9ca3af]">
        © 2025 Kukalakala ·{" "}
        <a href="#" className="hover:text-[#6b7280]">Termos</a>
        {" "}·{" "}
        <a href="#" className="hover:text-[#6b7280]">Privacidade</a>
      </p>
    </div>
  );
}
