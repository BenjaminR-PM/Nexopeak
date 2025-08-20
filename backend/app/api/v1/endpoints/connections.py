from fastapi import APIRouter

router = APIRouter()

@router.get("/connections")
async def get_connections():
    """Get connections"""
    return {"message": "Connections list"}
