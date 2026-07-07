from fastapi import FastAPI, Request
import uvicorn
from controller.candidate_controller import candidate_controller
from controller.candidate_profile_controller import profile_controller
from controller.company_controller import company_controller
from controller.job_controller import job_controller
from controller.application_controller import application_controller
from controller.auth.company_auth_controller import company_auth_controller
from controller.auth.user_auth_controller import candidate_auth_controller
from database import create_table
from exception.global_exceptipns import global_exceptions
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="kukalakala",
    version="1.0")


CORSMiddleware(
    app,
    allow_origins=['*'],
    allow_methods=["*"],
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

create_table() # cria as tabelas da base de dados.
global_exceptions(app)

routes = [
    candidate_auth_controller,
    company_auth_controller,
    candidate_controller,
    profile_controller,
    company_controller,
    job_controller,
    application_controller
]

for controller in routes:
    app.include_router(controller)


if __name__ == '__main__':
    uvicorn.run()
