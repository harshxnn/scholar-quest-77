from fastapi import FastAPI, UploadFile, Form, File, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import json
import os

from .agent import run_chat_orchestrator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/chat")
async def ping():
    return {"status": "ok", "message": "FastAPI is running natively on Vercel Python"}

@app.post("/api/chat")
async def chat_endpoint(
    request: Request,
    files: List[UploadFile] = File(None)
):
    try:
        # In Vercel, multipart/form-data might need to be parsed from form
        form = await request.form()
        query = form.get("query", "")
        
        active_sources = form.get("activeSources", "[]")
        active_addons = form.get("activeAddons", "[]")
        advanced_options = form.get("advancedOptions", "{}")

        parsed_sources = json.loads(active_sources) if active_sources else []
        parsed_addons = json.loads(active_addons) if active_addons else []
        parsed_advanced = json.loads(advanced_options) if advanced_options else {}

        # Save files temporarily for PyPDFLoader
        processed_files = []
        if files:
            for file in files:
                if file.filename:
                    # In Vercel /tmp is the only writable directory
                    temp_path = f"/tmp/{file.filename}"
                    content = await file.read()
                    with open(temp_path, "wb") as f:
                        f.write(content)
                    processed_files.append({"path": temp_path, "name": file.filename})

        response = run_chat_orchestrator(
            query=query,
            active_sources=parsed_sources,
            active_addons=parsed_addons,
            advanced_options=parsed_advanced,
            files=processed_files
        )

        # Cleanup temp files
        for pf in processed_files:
             try:
                 os.remove(pf["path"])
             except:
                 pass

        return {"response": response}
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return {"error": str(e)}

