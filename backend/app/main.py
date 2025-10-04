from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_customer

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_customer.router, prefix="/auth", tags=["Auth"])
