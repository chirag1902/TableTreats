from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.restaurant_router import router as restaurant_router

app = FastAPI()

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # you can restrict later: ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(restaurant_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Restaurant backend is running"}
