from fastapi import APIRouter

router = APIRouter()

@router.get("/insights")
async def get_insights():
    """Get insights"""
    return {"message": "Insights list"}
