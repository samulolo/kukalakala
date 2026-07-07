"use client";

import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-api";
import Input from "@/components/ui/Input";
import { saveAuthSession } from "@/lib/auth/auth-session";
import { getSafeRedirectPath } from "@/lib/auth/auth-redirect";

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [type, setType] = useState<"candidate" | "company">("candidate")
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {login, loginCompany} = useAuth()
  const router = useRouter()


  const handleLogin = async function(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Só falta preencher o email e a palavra-passe para continuares.")
      return
    }

    setIsSubmitting(true)

    try {

      const response = type === "company"
        ? await loginCompany({email, password})
        : await login({email, password})
      saveAuthSession(response.data, type)
      setSuccessMessage("Login feito com sucesso. Estamos a preparar o teu painel.")
      const redirectTo = new URLSearchParams(window.location.search).get("redirect")
      router.replace(getSafeRedirectPath(response.data, redirectTo, type))

    } catch(error){
      const message = error instanceof Error ? error.message : "Não foi possível fazer login."
      setErrorMessage(
        message === "Candidato não encontrado"
          ? "Não encontramos uma conta com esse email. Confirma o endereço ou cria uma conta nova."
          : message
      )
    } finally {
      setIsSubmitting(false)
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
          Entrar na conta
        </h1>
        <p className="mt-1 text-[0.85rem] text-[#6b7280]">
          Sem conta?{" "}
          <Link href="/registo" className="font-medium text-accent hover:opacity-80">
            Criar grátis
          </Link>
        </p>

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

        <div className="relative my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#e4e7ec]" />
          <span className="text-[0.73rem] text-[#9ca3af]">ou continua com email</span>
          <div className="h-px flex-1 bg-[#e4e7ec]" />
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          <div className="flex rounded-xl bg-[#f5f6f8] p-1">
            {(["candidate", "company"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={type === item}
                onClick={() => {
                  setType(item)
                  setErrorMessage("")
                  setSuccessMessage("")
                }}
                className={`flex-1 rounded-lg py-2 text-[0.82rem] font-semibold transition-all ${
                  type === item
                    ? "bg-accent text-white shadow-sm"
                    : "text-[#667085] hover:bg-white hover:text-[#0f172a]"
                }`}
              >
                {item === "candidate" ? "Candidato" : "Empresa"}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-[#fecaca] bg-[#fff7f7] px-3.5 py-3" role="alert">
              <p className="text-[0.82rem] font-semibold text-[#991b1b]">Não conseguimos entrar</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-[#b91c1c]">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-3.5 py-3" role="status">
              <p className="text-[0.82rem] font-semibold text-[#166534]">Tudo certo</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-[#16813f]">{successMessage}</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[0.8rem] font-medium text-[#374151]">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c7d0]" />
              <Input
              value={email}
              type="email"
              placeHolder="nome@example.com"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="current-email"
              style="h-10 w-full rounded-xl border border-[#e4e7ec] pl-9 pr-3.5 text-[0.9rem] text-[#0f172a] outline-none transition placeholder:text-[#c0c7d0] focus:border-accent focus:ring-2 focus:ring-accent/10" />

            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[0.8rem] font-medium text-[#374151]">
                Palavra-passe
              </label>
              <a href="#" className="text-[0.75rem] text-[#9ca3af] transition hover:text-accent">
                Esqueceste?
              </a>
            </div>
            <div className="relative">
              <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#c0c7d0]" />
               <Input
               value={password}
                type={show ? "text" : "password"}
                placeHolder="*********"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                style="h-10 w-full rounded-xl border border-[#e4e7ec] pl-9 pr-10 text-[0.9rem] text-[#0f172a] outline-none transition placeholder:text-[#c0c7d0] focus:border-accent focus:ring-2 focus:ring-accent/10"/>

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 h-10 w-full rounded-xl bg-accent text-[0.88rem] font-semibold text-white transition hover:bg-accent-dark active:scale-[0.99]"
          >
            {isSubmitting ? "A entrar..." : "Entrar"}
          </button>
        </form>
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
