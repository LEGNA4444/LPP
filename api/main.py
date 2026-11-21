from fastapi import FastAPI
from modules import loader

app = FastAPI(title="LPP API")

loader.load_modules(app)

@app.get("/")
def root():
    return {"status": "LPP API corriendo 🟢"}
