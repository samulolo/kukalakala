import json
import os
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from openai import OpenAI

from domain.candidate_profile import CandidateProfile
from domain.job import Job
from exception.app_exceptions import BadRequest


class OpenAiService:

    def __init__(self, openai_api_key : Optional[str] = None, model : Optional[str] = None):
        load_dotenv()
        self.openai_api_key = openai_api_key or os.getenv("OPENAI_API_KEY") or os.getenv("OPEN_AI_KEY")
        self.model = model or os.getenv("OPENAI_MODEL") or "gpt-4.1-mini"
        self.client = OpenAI(api_key=self.openai_api_key) if self.openai_api_key else None

    def ask_ai(self, user_message : str) -> str:
        if not self.client:
            raise BadRequest("A chave da OpenAI não está configurada")

        response = self.client.responses.create(
            model=self.model,
            input=[
                {
                    "role": "system",
                    "content": "Você é um assistente útil para este projeto."
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )

        return response.output_text

    def analyze_candidate_for_job(self, candidate_profile : CandidateProfile, job : Job) -> Dict[str, Any]:
        if not self.client:
            raise BadRequest("A chave da OpenAI não está configurada")

        resume_text = (candidate_profile.resume_text or "").strip()
        if not resume_text:
            raise BadRequest("Não foi possível analisar o currículo porque o texto extraído está vazio")

        response = self.client.responses.create(
            model=self.model,
            instructions=(
                "Você é um especialista sénior em recrutamento técnico. "
                "Compare o currículo do candidato com a vaga e responda apenas no JSON definido. "
                "Use evidências do currículo e dos requisitos. Não invente experiências não citadas. "
                "A explicação do candidato deve falar diretamente com o candidato e começar exatamente com: "
                "'De acordo ao seu perfil e currículo, você possui'. "
                "A explicação da empresa deve ajudar a empresa a decidir se o candidato é ideal para a vaga, "
                "destacando aderência, lacunas, riscos e pontos relevantes para tomada de decisão."
            ),
            input=self._build_candidate_job_prompt(candidate_profile, job, resume_text),
            text={
                "format": {
                    "type": "json_schema",
                    "name": "candidate_job_match",
                    "strict": True,
                    "schema": {
                        "type": "object",
                        "additionalProperties": False,
                        "properties": {
                            "competencias_chave": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "Competências do candidato mais relevantes para esta vaga."
                            },
                            "score": {
                                "type": "number",
                                "minimum": 0,
                                "maximum": 100,
                                "description": "Pontuação percentual de compatibilidade entre currículo e vaga, de 0 a 100. Use 90 para 90%, nunca 9."
                            },
                            "explicacao_candidato": {
                                "type": "string",
                                "description": "Explicação curta do score, dirigida ao candidato, começando com 'De acordo ao seu perfil e currículo, você possui'."
                            },
                            "explicacao_empresa": {
                                "type": "string",
                                "description": "Explicação curta para a empresa, focada em fit do candidato, lacunas, riscos e critérios de decisão."
                            }
                        },
                        "required": ["competencias_chave", "score", "explicacao_candidato", "explicacao_empresa"]
                    }
                }
            },
            temperature=0.2,
        )

        return self._normalize_analysis(json.loads(response.output_text))

    def _build_candidate_job_prompt(self, candidate_profile : CandidateProfile, job : Job, resume_text : str) -> str:
        requirements = job.requirements or []
        key_competences = candidate_profile.key_competences or []

        return (
            "Analise a compatibilidade entre o candidato e a vaga.\n\n"
            f"Vaga: {job.title}\n"
            f"Descrição da vaga:\n{job.description}\n\n"
            "Requisitos da vaga:\n"
            f"{self._format_list(requirements)}\n\n"
            "Competências cadastradas no perfil do candidato:\n"
            f"{self._format_list(key_competences)}\n\n"
            f"Anos de experiência informados: {candidate_profile.experience_years or 0}\n\n"
            "Texto extraído do currículo:\n"
            f"{resume_text}"
        )

    def _format_list(self, values : List[str]) -> str:

        if not values:
            return "- Não informado"

        return "\n".join(f"- {value}" for value in values)

    def _normalize_analysis(self, analysis : Dict[str, Any]) -> Dict[str, Any]:
        score = float(analysis.get("score", 0))

        if 0 < score <= 10:
            score = score * 10

        score = max(0, min(100, score))

        legacy_explanation = analysis.get("explicacao") or ""
        candidate_explanation = self._format_candidate_explanation(
            analysis.get("explicacao_candidato") or legacy_explanation
        )
        company_explanation = self._format_company_explanation(
            analysis.get("explicacao_empresa") or legacy_explanation
        )

        return {
            "competencias_chave": analysis.get("competencias_chave") or [],
            "score": score,
            "explicacao": candidate_explanation,
            "explicacao_candidato": candidate_explanation,
            "explicacao_empresa": company_explanation,
        }

    def _format_candidate_explanation(self, explanation : str) -> str:
        prefix = "De acordo ao seu perfil e currículo, você possui"
        clean_explanation = explanation.strip()

        if not clean_explanation:
            return ""

        if clean_explanation.lower().startswith(prefix.lower()):
            return clean_explanation

        return f"{prefix} {clean_explanation[0].lower()}{clean_explanation[1:]}"

    def _format_company_explanation(self, explanation : str) -> str:
        clean_explanation = explanation.strip()

        if not clean_explanation:
            return ""

        return clean_explanation
