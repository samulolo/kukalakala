import json
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from sqlmodel import Session, select

sys.path.append(str(Path(__file__).resolve().parents[1]))

from database import create_table, engine
from domain.application import Application, ApplicationStatus
from domain.candidate import Candidate
from domain.candidate_profile import CandidateProfile, ProfessionalSituationStatus
from domain.company import Company
from domain.job import Job, JobType


now = datetime.now(timezone.utc)


companies_data = [
    {
        "name": "Kukalakala Labs",
        "sector": "Tecnologia",
        "location": "Luanda",
        "foundation_date": date(2021, 4, 12),
    },
    {
        "name": "Atlântico Digital",
        "sector": "Fintech",
        "location": "Lisboa",
        "foundation_date": date(2019, 8, 5),
    },
]

jobs_data = [
    {
        "company": "Kukalakala Labs",
        "title": "Backend Developer",
        "description": "Desenvolver APIs em Python, manter serviços FastAPI e colaborar na evolução do matching com IA.",
        "requirements": ["Python", "FastAPI", "PostgreSQL", "API design"],
        "type": JobType.HYBRID,
        "response_time": 3,
    },
    {
        "company": "Kukalakala Labs",
        "title": "Frontend Engineer",
        "description": "Construir interfaces React acessíveis para candidatos e equipas de recrutamento.",
        "requirements": ["React", "TypeScript", "Accessibility", "Testing"],
        "type": JobType.REMOTE,
        "response_time": 2,
    },
    {
        "company": "Atlântico Digital",
        "title": "Data Analyst",
        "description": "Analisar funis de candidatura, criar dashboards operacionais e comunicar insights às equipas.",
        "requirements": ["SQL", "Dashboards", "Funnel analysis", "Communication"],
        "type": JobType.ON_SITE,
        "response_time": 5,
    },
]

candidates_data = [
    {
        "name": "Ana Pereira",
        "email": "ana.pereira@example.com",
        "experience_years": 5,
        "professional_situation": ProfessionalSituationStatus.EMPLOYED,
        "key_competences": ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy"],
        "resume_text": "Backend engineer com 5 anos de experiência em Python, FastAPI, PostgreSQL e desenho de APIs REST.",
        "applications": [
            {
                "job": "Backend Developer",
                "status": ApplicationStatus.INTERVIEW,
                "score": 91,
                "competencias_chave": ["Python", "FastAPI", "PostgreSQL"],
                "explicacao": "Perfil muito alinhado com a vaga. A candidata demonstra experiência direta em FastAPI, PostgreSQL e desenho de APIs.",
            },
            {
                "job": "Frontend Engineer",
                "status": ApplicationStatus.IN_REVIEW,
                "score": 63,
                "competencias_chave": ["Testing", "API design"],
                "explicacao": "Tem boa colaboração com frontend, mas o currículo não mostra experiência forte em React e acessibilidade.",
            },
        ],
    },
    {
        "name": "Mateus Silva",
        "email": "mateus.silva@example.com",
        "experience_years": 4,
        "professional_situation": ProfessionalSituationStatus.EMPLOYED,
        "key_competences": ["React", "TypeScript", "Testing", "Accessibility"],
        "resume_text": "Frontend engineer focado em React, TypeScript, componentes acessíveis e testes automatizados.",
        "applications": [
            {
                "job": "Frontend Engineer",
                "status": ApplicationStatus.SUBMITTED,
                "score": 88,
                "competencias_chave": ["React", "TypeScript", "Accessibility"],
                "explicacao": "Bom encaixe técnico para a vaga, com experiência relevante em React, TypeScript e acessibilidade.",
            },
        ],
    },
    {
        "name": "Beatriz Costa",
        "email": "beatriz.costa@example.com",
        "experience_years": 3,
        "professional_situation": ProfessionalSituationStatus.UNEMPLOYED,
        "key_competences": ["SQL", "Power BI", "Dashboards", "Communication"],
        "resume_text": "Analista de dados com experiência em SQL, Power BI, reporting operacional e comunicação com stakeholders.",
        "applications": [
            {
                "job": "Data Analyst",
                "status": ApplicationStatus.APPROVED,
                "score": 86,
                "competencias_chave": ["SQL", "Dashboards", "Communication"],
                "explicacao": "A candidata cobre os requisitos principais e apresenta experiência prática em dashboards e comunicação de insights.",
            },
        ],
    },
]


def get_or_create_company(session: Session, data: dict) -> Company:
    company = session.exec(select(Company).where(Company.name == data["name"])).first()

    if company:
        return company

    company = Company(**data)
    session.add(company)
    session.commit()
    session.refresh(company)
    return company


def get_or_create_job(session: Session, company: Company, data: dict) -> Job:
    job = session.exec(
        select(Job).where(Job.company_id == company.id, Job.title == data["title"])
    ).first()

    if job:
        return job

    job = Job(
        company_id=company.id,
        title=data["title"],
        description=data["description"],
        requirements=data["requirements"],
        is_active=True,
        application_period_start=now - timedelta(days=15),
        application_period_end=now + timedelta(days=45),
        type=data["type"],
        response_time=data["response_time"],
    )
    session.add(job)
    session.commit()
    session.refresh(job)
    return job


def get_or_create_candidate(session: Session, data: dict) -> Candidate:
    candidate = session.exec(select(Candidate).where(Candidate.email == data["email"])).first()

    if candidate:
        return candidate

    candidate = Candidate(name=data["name"], email=data["email"])
    session.add(candidate)
    session.commit()
    session.refresh(candidate)
    return candidate


def upsert_profile(session: Session, candidate: Candidate, data: dict) -> CandidateProfile:
    profile = session.get(CandidateProfile, candidate.id)

    if profile is None:
        profile = CandidateProfile(candidate_id=candidate.id)

    profile.experience_years = data["experience_years"]
    profile.resume_url = f"seed://cv/{candidate.id}.pdf"
    profile.resume_text = data["resume_text"]
    profile.professional_situation = data["professional_situation"]
    profile.key_competences = data["key_competences"]
    profile.updated_at = now

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile


def get_or_create_application(session: Session, candidate: Candidate, job: Job, data: dict) -> Application:
    application = session.exec(
        select(Application).where(
            Application.candidate_id == candidate.id,
            Application.job_id == job.id,
        )
    ).first()

    if application is None:
        application = Application(candidate_id=candidate.id, job_id=job.id)

    application.status = data["status"]
    application.ai_score = data["score"]
    application.ai_suggestions = json.dumps(
        {
            "competencias_chave": data["competencias_chave"],
            "explicacao": data["explicacao"],
            "explicacao_candidato": f"De acordo ao seu perfil e currículo, você possui {data['explicacao'][0].lower()}{data['explicacao'][1:]}",
            "explicacao_empresa": data["explicacao"],
        },
        ensure_ascii=False,
    )
    application.applied_at = now - timedelta(days=max(1, 10 - int(data["score"] / 10)))
    application.updated_at = now

    session.add(application)
    session.commit()
    session.refresh(application)
    return application


def main() -> None:
    create_table()

    with Session(engine) as session:
        companies = {
            data["name"]: get_or_create_company(session, data)
            for data in companies_data
        }
        jobs = {
            data["title"]: get_or_create_job(session, companies[data["company"]], data)
            for data in jobs_data
        }

        created_applications = 0

        for candidate_data in candidates_data:
            candidate = get_or_create_candidate(session, candidate_data)
            upsert_profile(session, candidate, candidate_data)

            for application_data in candidate_data["applications"]:
                get_or_create_application(session, candidate, jobs[application_data["job"]], application_data)
                created_applications += 1

    print(f"Seed concluído: {len(candidates_data)} candidatos e {created_applications} candidaturas disponíveis.")


if __name__ == "__main__":
    main()
