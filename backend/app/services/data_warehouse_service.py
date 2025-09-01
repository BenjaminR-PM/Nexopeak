from sqlalchemy.orm import Session
from app.models.data_warehouse import DataWarehouse, Dataset
from app.core.database import get_db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def initialize_default_data_warehouses(db: Session):
    """Initialize default data warehouses if they don't exist"""
    
    # Check if data warehouses already exist
    existing_warehouses = db.query(DataWarehouse).count()
    if existing_warehouses > 0:
        logger.info("Data warehouses already initialized")
        return
    
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
    
    try:
        db.commit()
        logger.info("Successfully initialized default data warehouses")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to initialize data warehouses: {e}")
        raise

def get_canada_open_data_sample():
    """Get sample data for Canada Open Data dashboard"""
    return {
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
