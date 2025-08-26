#!/usr/bin/env python3

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Simple test app
app = FastAPI(title="Test Campaign API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test server is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/v1/campaigns/types/options")
async def get_campaign_types():
    return {
        "campaign_types": [
            {"value": "search", "label": "Search", "description": "Text ads on search results"},
            {"value": "display", "label": "Display", "description": "Visual ads on websites"},
            {"value": "video", "label": "Video", "description": "Video ads on platforms like YouTube"},
        ],
        "platforms": [
            {"value": "google_ads", "label": "Google Ads", "description": "Google's advertising platform"},
            {"value": "facebook", "label": "Facebook", "description": "Facebook advertising"},
        ]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8001)

