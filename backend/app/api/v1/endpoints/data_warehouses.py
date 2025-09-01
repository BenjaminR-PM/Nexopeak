from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

# Constants
DATA_WAREHOUSE_NOT_FOUND = "Data warehouse not found"
from app.core.database import get_db
from app.models.data_warehouse import DataWarehouse, DataWarehouseConnection, Dataset, DataWarehouseMetrics
from app.schemas.data_warehouse import (
    DataWarehouse as DataWarehouseSchema,
    DataWarehouseCreate,
    DataWarehouseUpdate,
    DataWarehouseListResponse,
    DataWarehouseConnection as DataWarehouseConnectionSchema,
    DataWarehouseConnectionCreate,
    DataWarehouseConnectionUpdate,
    ConnectionListResponse,
    Dataset as DatasetSchema,
    DatasetCreate,
    DatasetUpdate,
    DatasetListResponse,
    CanadaOpenDataDashboard,
    CanadaOpenDataMetrics,
    InternetUsageByAge,
    StreamingServicesByIncome,
    DigitalAdoptionByProvince,
    ConnectionType,
    MonthlyTrend
)
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user
from datetime import datetime
import requests
import json

router = APIRouter()

# Sample data for Canada Open Data (in production, this would come from actual API calls)
SAMPLE_CANADA_DATA = {
    "metrics": {
        "total_internet_users": 33.4,
        "streaming_adoption_rate": 68.7,
        "smart_home_adoption_rate": 31.2,
        "online_shopping_rate": 74.8,
        "last_updated": datetime.now()
    },
    "internet_usage_by_age": [
        {"age_group": "15-24", "percentage": 98.5, "users": 2450000},
        {"age_group": "25-34", "percentage": 97.8, "users": 2890000},
        {"age_group": "35-44", "percentage": 96.2, "users": 2340000},
        {"age_group": "45-54", "percentage": 93.1, "users": 2100000},
        {"age_group": "55-64", "percentage": 87.4, "users": 1980000},
        {"age_group": "65+", "percentage": 71.2, "users": 1560000}
    ],
    "streaming_services_by_income": [
        {"income_quartile": "Lowest 25%", "netflix": 45.2, "amazon": 28.1, "disney": 22.3, "other": 15.8},
        {"income_quartile": "Second 25%", "netflix": 62.4, "amazon": 41.2, "disney": 35.7, "other": 28.4},
        {"income_quartile": "Third 25%", "netflix": 78.9, "amazon": 58.3, "disney": 52.1, "other": 42.6},
        {"income_quartile": "Highest 25%", "netflix": 89.7, "amazon": 74.5, "disney": 68.9, "other": 58.2}
    ],
    "digital_adoption_by_province": [
        {"province": "BC", "smart_home": 34.2, "online_shopping": 78.9, "gov_services": 65.4, "social_media": 82.1},
        {"province": "AB", "smart_home": 31.8, "online_shopping": 76.3, "gov_services": 62.1, "social_media": 79.8},
        {"province": "SK", "smart_home": 28.4, "online_shopping": 71.2, "gov_services": 58.7, "social_media": 75.3},
        {"province": "MB", "smart_home": 29.1, "online_shopping": 72.8, "gov_services": 59.9, "social_media": 76.8},
        {"province": "ON", "smart_home": 36.7, "online_shopping": 81.2, "gov_services": 68.3, "social_media": 84.6},
        {"province": "QC", "smart_home": 32.9, "online_shopping": 75.4, "gov_services": 61.8, "social_media": 80.2},
        {"province": "NB", "smart_home": 26.3, "online_shopping": 68.9, "gov_services": 55.2, "social_media": 72.4},
        {"province": "NS", "smart_home": 27.8, "online_shopping": 70.1, "gov_services": 57.6, "social_media": 74.1},
        {"province": "PE", "smart_home": 25.1, "online_shopping": 66.7, "gov_services": 53.8, "social_media": 70.9},
        {"province": "NL", "smart_home": 24.6, "online_shopping": 65.3, "gov_services": 52.4, "social_media": 69.7}
    ],
    "connection_types": [
        {"name": "High-speed broadband", "value": 68.4, "color": "#3B82F6"},
        {"name": "Cable", "value": 45.2, "color": "#10B981"},
        {"name": "DSL", "value": 23.7, "color": "#F59E0B"},
        {"name": "Fiber optic", "value": 18.9, "color": "#8B5CF6"},
        {"name": "Satellite", "value": 8.3, "color": "#EF4444"},
        {"name": "Mobile/Wireless", "value": 12.6, "color": "#06B6D4"}
    ],
    "monthly_trends": [
        {"month": "Jan 2024", "internet_users": 32.1, "streaming_users": 24.8, "online_shoppers": 18.9},
        {"month": "Feb 2024", "internet_users": 32.3, "streaming_users": 25.2, "online_shoppers": 19.4},
        {"month": "Mar 2024", "internet_users": 32.6, "streaming_users": 25.8, "online_shoppers": 20.1},
        {"month": "Apr 2024", "internet_users": 32.8, "streaming_users": 26.1, "online_shoppers": 20.6},
        {"month": "May 2024", "internet_users": 33.1, "streaming_users": 26.5, "online_shoppers": 21.2},
        {"month": "Jun 2024", "internet_users": 33.4, "streaming_users": 26.9, "online_shoppers": 21.8}
    ]
}

@router.get("/", response_model=DataWarehouseListResponse)
async def get_data_warehouses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of available data warehouses"""
    query = db.query(DataWarehouse)
    
    if category:
        query = query.filter(DataWarehouse.category == category)
    if status:
        query = query.filter(DataWarehouse.status == status)
    
    total = query.count()
    warehouses = query.offset(skip).limit(limit).all()
    
    return DataWarehouseListResponse(
        warehouses=warehouses,
        total=total,
        page=skip // limit + 1,
        per_page=limit
    )

@router.post("/", response_model=DataWarehouseSchema)
async def create_data_warehouse(
    warehouse: DataWarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new data warehouse"""
    db_warehouse = DataWarehouse(**warehouse.dict())
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

@router.get("/{warehouse_id}", response_model=DataWarehouseSchema)
async def get_data_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific data warehouse"""
    warehouse = db.query(DataWarehouse).filter(DataWarehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail=DATA_WAREHOUSE_NOT_FOUND)
    return warehouse

@router.put("/{warehouse_id}", response_model=DataWarehouseSchema)
async def update_data_warehouse(
    warehouse_id: int,
    warehouse_update: DataWarehouseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a data warehouse"""
    warehouse = db.query(DataWarehouse).filter(DataWarehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail=DATA_WAREHOUSE_NOT_FOUND)
    
    update_data = warehouse_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(warehouse, field, value)
    
    db.commit()
    db.refresh(warehouse)
    return warehouse

@router.delete("/{warehouse_id}")
async def delete_data_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a data warehouse"""
    warehouse = db.query(DataWarehouse).filter(DataWarehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail=DATA_WAREHOUSE_NOT_FOUND)
    
    db.delete(warehouse)
    db.commit()
    return {"message": "Data warehouse deleted successfully"}

# Connection endpoints
@router.get("/{warehouse_id}/connections", response_model=ConnectionListResponse)
async def get_warehouse_connections(
    warehouse_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get connections for a specific warehouse"""
    query = db.query(DataWarehouseConnection).filter(
        DataWarehouseConnection.warehouse_id == warehouse_id,
        DataWarehouseConnection.organization_id == current_user.organization_id
    )
    
    total = query.count()
    connections = query.offset(skip).limit(limit).all()
    
    return ConnectionListResponse(
        connections=connections,
        total=total,
        page=skip // limit + 1,
        per_page=limit
    )

@router.post("/{warehouse_id}/connections", response_model=DataWarehouseConnectionSchema)
async def create_warehouse_connection(
    warehouse_id: int,
    connection: DataWarehouseConnectionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new warehouse connection"""
    # Verify warehouse exists
    warehouse = db.query(DataWarehouse).filter(DataWarehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail=DATA_WAREHOUSE_NOT_FOUND)
    
    db_connection = DataWarehouseConnection(
        **connection.dict(),
        organization_id=current_user.organization_id
    )
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    return db_connection

# Dataset endpoints
@router.get("/{warehouse_id}/datasets", response_model=DatasetListResponse)
async def get_warehouse_datasets(
    warehouse_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get datasets for a specific warehouse"""
    query = db.query(Dataset).filter(Dataset.warehouse_id == warehouse_id)
    
    total = query.count()
    datasets = query.offset(skip).limit(limit).all()
    
    return DatasetListResponse(
        datasets=datasets,
        total=total,
        page=skip // limit + 1,
        per_page=limit
    )

@router.post("/{warehouse_id}/datasets", response_model=DatasetSchema)
async def create_dataset(
    warehouse_id: int,
    dataset: DatasetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new dataset"""
    # Verify warehouse exists
    warehouse = db.query(DataWarehouse).filter(DataWarehouse.id == warehouse_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail=DATA_WAREHOUSE_NOT_FOUND)
    
    db_dataset = Dataset(**dataset.dict())
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

# Canada Open Data specific endpoints
@router.get("/canada-open-data/dashboard", response_model=CanadaOpenDataDashboard)
async def get_canada_open_data_dashboard(
    current_user: User = Depends(get_current_user)
):
    """Get Canada Open Data dashboard data"""
    
    # In production, this would make actual API calls to open.canada.ca
    # For now, we return sample data
    
    # Get available datasets from database
    # db_datasets = db.query(Dataset).join(DataWarehouse).filter(
    #     DataWarehouse.name == "Government of Canada Open Data"
    # ).all()
    
    # Sample datasets for demonstration
    sample_datasets = [
        {
            "id": 1,
            "warehouse_id": 1,
            "dataset_id": "75e0a4a2-2bb0-4727-af1f-ff9db913171d",
            "name": "Internet Services by Age Group and Household Income",
            "description": "Percentages of Internet users by selected services and technologies",
            "api_endpoint": "https://open.canada.ca/data/api/action/datastore_search?resource_id=75e0a4a2-2bb0-4727-af1f-ff9db913171d",
            "download_url": "https://open.canada.ca/data/en/dataset/75e0a4a2-2bb0-4727-af1f-ff9db913171d",
            "record_count": "2,450 records",
            "last_updated": datetime.now(),
            "data_schema": {},
            "sample_data": {},
            "tags": ["internet", "demographics", "streaming"],
            "is_active": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    ]
    
    return CanadaOpenDataDashboard(
        metrics=CanadaOpenDataMetrics(**SAMPLE_CANADA_DATA["metrics"]),
        internet_usage_by_age=[InternetUsageByAge(**item) for item in SAMPLE_CANADA_DATA["internet_usage_by_age"]],
        streaming_services_by_income=[StreamingServicesByIncome(**item) for item in SAMPLE_CANADA_DATA["streaming_services_by_income"]],
        digital_adoption_by_province=[DigitalAdoptionByProvince(**item) for item in SAMPLE_CANADA_DATA["digital_adoption_by_province"]],
        connection_types=[ConnectionType(**item) for item in SAMPLE_CANADA_DATA["connection_types"]],
        monthly_trends=[MonthlyTrend(**item) for item in SAMPLE_CANADA_DATA["monthly_trends"]],
        available_datasets=sample_datasets
    )

@router.post("/canada-open-data/refresh")
async def refresh_canada_open_data(
    current_user: User = Depends(get_current_user)
):
    """Refresh Canada Open Data by fetching latest data"""
    
    # In production, this would:
    # 1. Make API calls to open.canada.ca endpoints
    # 2. Process and store the data
    # 3. Update metrics and cache
    
    # For now, simulate the refresh
    return {
        "message": "Canada Open Data refreshed successfully",
        "last_updated": datetime.now(),
        "records_processed": 5000
    }

@router.get("/canada-open-data/export")
async def export_canada_open_data(
    format: str = Query("json", regex="^(json|csv|xlsx)$"),
    current_user: User = Depends(get_current_user)
):
    """Export Canada Open Data in various formats"""
    
    if format == "json":
        return SAMPLE_CANADA_DATA
    elif format == "csv":
        # In production, convert to CSV format
        return {"message": "CSV export not implemented yet"}
    elif format == "xlsx":
        # In production, convert to Excel format
        return {"message": "Excel export not implemented yet"}
    
    raise HTTPException(status_code=400, detail="Invalid export format")
