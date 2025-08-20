from fastapi import APIRouter

router = APIRouter()

@router.get("/etl/status")
async def get_etl_status():
    """Get ETL job status"""
    return {"message": "ETL status"}

@router.post("/etl/trigger")
async def trigger_etl():
    """Trigger ETL job"""
    return {"message": "ETL job triggered"}
