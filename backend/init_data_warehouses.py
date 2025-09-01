#!/usr/bin/env python3
"""
Initialize data warehouses in production database
"""

from app.core.database import Base, engine, get_db
from app.models.data_warehouse import DataWarehouse, Dataset
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Initialize default data warehouses"""
    
    # Create all tables
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Check if data warehouses already exist
        existing_warehouses = db.query(DataWarehouse).count()
        if existing_warehouses > 0:
            logger.info(f"Data warehouses already initialized ({existing_warehouses} found)")
            return
        
        logger.info("Initializing default data warehouses...")
        
        # Create Government of Canada Open Data warehouse
        canada_warehouse = DataWarehouse(
            name="Government of Canada Open Data",
            provider="Government of Canada",
            category="Government",
            description="Comprehensive dataset including household internet usage, streaming habits, regional digital adoption rates, and demographic information.",
            api_url="https://open.canada.ca",
            status="active",
            data_types=["Demographics", "Internet Usage", "Digital Adoption", "Regional Data"],
            features=[
                "Household internet usage patterns",
                "Streaming service adoption rates", 
                "Regional digital divide analysis",
                "Age and income demographics",
                "Real-time data updates"
            ]
        )
        db.add(canada_warehouse)
        db.flush()  # Get the ID
        
        # Add datasets for Canada Open Data
        canada_datasets = [
            {
                "dataset_id": "75e0a4a2-2bb0-4727-af1f-ff9db913171d",
                "name": "Internet Services by Age Group and Household Income",
                "description": "Percentages of Internet users by selected services and technologies, including streaming services, smart home devices, and online shopping.",
                "api_endpoint": "https://open.canada.ca/data/api/action/datastore_search?resource_id=75e0a4a2-2bb0-4727-af1f-ff9db913171d",
                "download_url": "https://open.canada.ca/data/en/dataset/75e0a4a2-2bb0-4727-af1f-ff9db913171d",
                "record_count": "2,450 records",
                "tags": ["internet", "demographics", "streaming", "income"]
            },
            {
                "dataset_id": "419f2300-ce69-40c7-949c-ab7c2bf45258",
                "name": "Internet Use by Province and Age Group",
                "description": "Percentage of Canadians personal Internet use over the past three months, segmented by province and age group.",
                "api_endpoint": "https://open.canada.ca/data/api/action/datastore_search?resource_id=419f2300-ce69-40c7-949c-ab7c2bf45258",
                "download_url": "https://open.canada.ca/data/dataset/419f2300-ce69-40c7-949c-ab7c2bf45258",
                "record_count": "1,890 records",
                "tags": ["internet", "province", "age", "demographics"]
            },
            {
                "dataset_id": "c2da1d35-8833-4b6c-8cf4-ce13d711ddfc",
                "name": "Internet Use at Home by Connection Type",
                "description": "Information on Internet use at home, categorized by type of connection for Canada and selected regions.",
                "api_endpoint": "https://open.canada.ca/data/api/action/datastore_search?resource_id=c2da1d35-8833-4b6c-8cf4-ce13d711ddfc",
                "download_url": "https://open.canada.ca/data/en/dataset/c2da1d35-8833-4b6c-8cf4-ce13d711ddfc",
                "record_count": "856 records",
                "tags": ["internet", "connection", "broadband", "regional"]
            }
        ]
        
        for dataset_data in canada_datasets:
            dataset = Dataset(
                warehouse_id=canada_warehouse.id,
                **dataset_data,
                last_updated=datetime.now()
            )
            db.add(dataset)
        
        # Create Statistics Canada warehouse
        statcan_warehouse = DataWarehouse(
            name="Statistics Canada (StatCan)",
            provider="Statistics Canada",
            category="Government",
            description="Official statistics on demographics, income distribution, spending patterns, and economic indicators across Canadian regions.",
            status="coming_soon",
            data_types=["Demographics", "Economics", "Spending Patterns", "Income Data"],
            features=[
                "Age and income segmentation",
                "Media spending patterns",
                "Retail consumption data",
                "Service industry metrics",
                "Regional economic indicators"
            ]
        )
        db.add(statcan_warehouse)
        
        # Create Google Trends warehouse
        google_trends_warehouse = DataWarehouse(
            name="Google Trends API",
            provider="Google",
            category="Search & Trends",
            description="Real-time search interest data for Canada, enabling comparison with GA4 data to contextualize marketing campaigns.",
            api_url="https://trends.google.com",
            status="coming_soon",
            data_types=["Search Trends", "Interest Data", "Regional Trends", "Temporal Analysis"],
            features=[
                "Real-time search interest tracking",
                "Regional trend comparison",
                "Campaign contextualization",
                "Seasonal pattern analysis",
                "Competitive intelligence"
            ]
        )
        db.add(google_trends_warehouse)
        
        # Commit all changes
        db.commit()
        logger.info("Successfully initialized default data warehouses")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to initialize data warehouses: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
