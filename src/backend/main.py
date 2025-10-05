from fastapi import FastAPI

app = FastAPI(title="NiCE AI Backend", version="0.0.1")

@app.get("/api/health")
def health():
    return {"ok": True, "service": "backend", "version": "0.0.1"}
