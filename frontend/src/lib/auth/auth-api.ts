import { API_BASE_URL } from "../jobs-api"
import { getAuthToken } from "./auth-session"
import { supabase } from "@/supabase/lib"
import type { Session, User } from "@supabase/supabase-js"
import { normalizeErrorMessage } from "@/lib/friendly-error"

const CLIENT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? API_BASE_URL

type AuthCredentials = {
    email : string;
    password : string
}

type RegisterCredentials = {
    name: string;
    email: string;
    password: string;
}

type AuthCandidate = {
    id: string;
    name: string;
    email: string;
}

type AuthCompany = {
    id: string;
    name: string;
    email: string;
    sector: string;
    location: string;
    foundation_date: string | null;
}

type AuthSession = {
    candidate?: AuthCandidate;
    company?: AuthCompany;
    user: AuthCandidate | AuthCompany;
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
}

type CompanyRegisterCredentials = {
    name: string;
    email: string;
    password: string;
    sector: string;
    location: string;
    foundation_date?: string | null;
}

type AuthResponse = {
    status: number;
    data: AuthSession;
    message: string | null;
    timestamp: string;
}

type ApiErrorResponse = {
    message?: string | null;
    data?: Array<{
        msg?: string;
    }> | null;
}

type AuthRole = "candidate" | "company"


async function getErrorMessage(response : Response, fallback = "Não foi possível fazer login"){

    try {
        const payload = await response.json() as ApiErrorResponse
        const validationMessage = payload.data?.[0]?.msg?.replace("Value error, ", "")
        return normalizeErrorMessage(validationMessage || payload.message, fallback)
    } catch {
        return fallback
    }
}

function getMetadataValue(user: User, key: string) {
    const value = user.user_metadata?.[key]
    return typeof value === "string" ? value : ""
}

function getAccountType(user: User, fallback: AuthRole): AuthRole {
    const accountType = getMetadataValue(user, "account_type")
    return accountType === "company" || accountType === "candidate" ? accountType : fallback
}

function isEmailConfirmed(user: User) {
    return Boolean(user.email_confirmed_at || user.confirmed_at)
}

function buildSupabaseAuthSession(session: Session, user: User, role: AuthRole): AuthSession {
    const baseUser = {
        id: user.id,
        name: getMetadataValue(user, "name") || user.email || "Utilizador",
        email: user.email || "",
    }

    if (role === "company") {
        const company = {
            ...baseUser,
            sector: getMetadataValue(user, "sector"),
            location: getMetadataValue(user, "location"),
            foundation_date: getMetadataValue(user, "foundation_date") || getMetadataValue(user, "foundation_data") || null,
        }

        return {
            company,
            user: company,
            access_token: session.access_token,
            token_type: "Bearer",
            expires_in: session.expires_in ?? 3600,
        }
    }

    return {
        candidate: baseUser,
        user: baseUser,
        access_token: session.access_token,
        token_type: "Bearer",
        expires_in: session.expires_in ?? 3600,
    }
}

async function loginWithSupabase(credencials: AuthCredentials, role: AuthRole): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword(credencials)

    if (error) {
        throw new Error(normalizeErrorMessage(error.message, "Não conseguimos entrar agora. Confirma os dados e tenta novamente."))
    }

    if (!data.session || !data.user) {
        throw new Error("Não foi possível iniciar sessão. Tenta novamente.")
    }

    if (!isEmailConfirmed(data.user)) {
        await supabase.auth.signOut()
        throw new Error("Email not confirmed")
    }

    const accountType = getAccountType(data.user, role)

    if (accountType !== role) {
        await supabase.auth.signOut()
        throw new Error(
            accountType === "company"
                ? "Esta conta está registada como empresa."
                : "Esta conta está registada como candidato."
        )
    }

    return {
        status: 200,
        data: buildSupabaseAuthSession(data.session, data.user, accountType),
        message: null,
        timestamp: new Date().toISOString(),
    }
}


const useAuth = function(){

    const login = async function(credencials : AuthCredentials): Promise<AuthResponse>{
        return loginWithSupabase(credencials, "candidate")
    }

    const register = async function(credentials : RegisterCredentials): Promise<AuthResponse>{

        const response = await fetch(`${CLIENT_API_BASE_URL}/api/v1/candidate-auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify(credentials)
        })

        if (!response.ok){
            throw new Error(await getErrorMessage(response, "Não foi possível criar a conta"))
        }

        return await response.json() as AuthResponse
    }

    const loginCompany = async function(credencials : AuthCredentials): Promise<AuthResponse>{
        return loginWithSupabase(credencials, "company")
    }

    const registerCompany = async function(credentials : CompanyRegisterCredentials): Promise<AuthResponse>{
        const response = await fetch(`${CLIENT_API_BASE_URL}/api/v1/company-auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify(credentials)
        })

        if (!response.ok){
            throw new Error(await getErrorMessage(response, "Não foi possível criar a empresa"))
        }

        return await response.json() as AuthResponse
    }

    const me = async function(): Promise<AuthCandidate>{
        const token = getAuthToken()
        const response = await fetch(`${CLIENT_API_BASE_URL}/api/v1/candidate-auth/me`, {
            headers: {
                Authorization: `Bearer ${token ?? ""}`
            }
        })

        if (!response.ok){
            throw new Error(await getErrorMessage(response, "Sessão inválida ou expirada"))
        }

        const payload = await response.json() as {
            data: AuthCandidate
        }
        return payload.data
    }


    return {
        login,
        register,
        loginCompany,
        registerCompany,
        me
    }
}


export {useAuth}
export type { AuthCandidate, AuthCompany, AuthCredentials, AuthResponse, AuthSession, CompanyRegisterCredentials, RegisterCredentials }
