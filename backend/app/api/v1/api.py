from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, organizations, connections, insights, analytics, etl, campaigns, logs, admin

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
api_router.include_router(connections.router, prefix="/connections", tags=["connections"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(etl.router, prefix="/etl", tags=["etl"])
api_router.include_router(campaigns.router, prefix="/campaigns", tags=["campaigns"])
api_router.include_router(logs.router, prefix="/logs", tags=["logging"])
api_router.include_router(admin.router, prefix="/admin", tags=["administration"])
