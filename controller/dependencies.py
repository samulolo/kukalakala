from repository.candidate_repository import CandidateRepository
from repository.candidate_profile_repository import CandidateProfileRepository
from repository.company_repository import CompanyRepository
from repository.job_repository import JobRepository
from repository.application_repository import ApplicationRepository
from repository.application_message_repository import ApplicationMessageRepository
from service.candidate_service import CandidateService
from service.candidate_profile_service import CandidateProfileService
from service.company_service import CompanyService
from service.email_service import EmailService
from service.job_service import JobService
from service.application_service import ApplicationService
from service.open_ai_service import OpenAiService
from service.pdf_extraction_service import PdfExtractionService
from service.redis_service import RedisService
from database import session_db



def get_candidate_service(session : session_db):
    return CandidateService(candidate_repository=CandidateRepository(session))


def get_candidate_profile_service(session : session_db):
    return CandidateProfileService(
        candidate_profile_repository=CandidateProfileRepository(session),
        pdf_extraction_service=PdfExtractionService(),
        redis_service=RedisService()
    )


def get_company_service(session : session_db):
    return CompanyService(company_repository=CompanyRepository(session))


def get_job_service(session : session_db):
    return JobService(
        job_repository=JobRepository(session),
        company_repository=CompanyRepository(session),
        redis_service=RedisService()
    )


def get_application_service(session : session_db):
    return ApplicationService(
        application_repository=ApplicationRepository(session),
        candidate_repository=CandidateRepository(session),
        candidate_profile_repository=CandidateProfileRepository(session),
        job_repository=JobRepository(session),
        application_message_repository=ApplicationMessageRepository(session),
        open_ai_service=OpenAiService(),
        email_service=EmailService(),
        redis_service=RedisService()
    )
