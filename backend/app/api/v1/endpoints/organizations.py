from fastapi import APIRouter

router = APIRouter()

@router.get("/organizations")
async def get_organizations():
    """Get organizations"""
    return {"message": "Organizations list"}
