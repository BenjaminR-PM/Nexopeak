from fastapi import APIRouter

router = APIRouter()

@router.get("/analytics")
async def get_analytics():
    """Get analytics data"""
    return {"message": "Analytics data"}
