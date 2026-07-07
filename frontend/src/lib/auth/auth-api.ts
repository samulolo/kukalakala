import { API_BASE_URL } from "../jobs-api"
import { getAuthToken } from "./auth-session"

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


async function getErrorMessage(response : Response, fallback = "Não foi possível fazer login"){

    try {
        const payload = await response.json() as ApiErrorResponse
        const validationMessage = payload.data?.[0]?.msg?.replace("Value error, ", "")
        return validationMessage || payload.message || fallback
    } catch {
        return fallback
    }
}


const useAuth = function(){

    const login = async function(credencials : AuthCredentials): Promise<AuthResponse>{

        try {

            const response = await fetch(`${CLIENT_API_BASE_URL}/api/v1/candidate-auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body : JSON.stringify(credencials)
            })

            if (!response.ok){
                throw new Error(await getErrorMessage(response))
            }

            return await response.json() as AuthResponse

        } catch(error){
            throw error
        }
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
        const response = await fetch(`${CLIENT_API_BASE_URL}/api/v1/company-auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body : JSON.stringify(credencials)
        })

        if (!response.ok){
            throw new Error(await getErrorMessage(response))
        }

        return await response.json() as AuthResponse
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
