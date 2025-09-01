from typing import List, Optional, Dict, Any
from pydantic import BaseModel, HttpUrl
from datetime import datetime

# Base schemas
class DataWarehouseBase(BaseModel):
    name: str
    provider: str
    category: str
    description: Optional[str] = None
    api_url: Optional[HttpUrl] = None
    status: str = "active"
    data_types: Optional[List[str]] = []
    features: Optional[List[str]] = []

class DataWarehouseCreate(DataWarehouseBase):
    pass

class DataWarehouseUpdate(BaseModel):
    name: Optional[str] = None
    provider: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    api_url: Optional[HttpUrl] = None
    status: Optional[str] = None
    data_types: Optional[List[str]] = None
    features: Optional[List[str]] = None

class DataWarehouse(DataWarehouseBase):
    id: int
    last_updated: datetime
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Connection schemas
class DataWarehouseConnectionBase(BaseModel):
    warehouse_id: int
    connection_name: str
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    connection_config: Optional[Dict[str, Any]] = {}
    is_active: bool = True
    sync_frequency: str = "daily"

class DataWarehouseConnectionCreate(DataWarehouseConnectionBase):
    pass

class DataWarehouseConnectionUpdate(BaseModel):
    connection_name: Optional[str] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    connection_config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    sync_frequency: Optional[str] = None

class DataWarehouseConnection(DataWarehouseConnectionBase):
    id: int
    organization_id: int
    last_sync: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    warehouse: Optional[DataWarehouse] = None

    class Config:
        from_attributes = True

# Dataset schemas
class DatasetBase(BaseModel):
    dataset_id: str
    name: str
    description: Optional[str] = None
    api_endpoint: Optional[str] = None
    download_url: Optional[str] = None
    record_count: Optional[str] = None
    data_schema: Optional[Dict[str, Any]] = {}
    sample_data: Optional[Dict[str, Any]] = {}
    tags: Optional[List[str]] = []
    is_active: bool = True

class DatasetCreate(DatasetBase):
    warehouse_id: int

class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    api_endpoint: Optional[str] = None
    download_url: Optional[str] = None
    record_count: Optional[str] = None
    data_schema: Optional[Dict[str, Any]] = None
    sample_data: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    is_active: Optional[bool] = None

class Dataset(DatasetBase):
    id: int
    warehouse_id: int
    last_updated: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    warehouse: Optional[DataWarehouse] = None

    class Config:
        from_attributes = True

# Metrics schemas
class DataWarehouseMetricsBase(BaseModel):
    metric_name: str
    metric_value: Optional[str] = None
    metric_data: Optional[Dict[str, Any]] = {}

class DataWarehouseMetricsCreate(DataWarehouseMetricsBase):
    warehouse_id: int

class DataWarehouseMetrics(DataWarehouseMetricsBase):
    id: int
    warehouse_id: int
    organization_id: int
    date_recorded: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Response schemas
class DataWarehouseListResponse(BaseModel):
    warehouses: List[DataWarehouse]
    total: int
    page: int
    per_page: int

class DatasetListResponse(BaseModel):
    datasets: List[Dataset]
    total: int
    page: int
    per_page: int

class ConnectionListResponse(BaseModel):
    connections: List[DataWarehouseConnection]
    total: int
    page: int
    per_page: int

# Canada Open Data specific schemas
class CanadaOpenDataMetrics(BaseModel):
    total_internet_users: float
    streaming_adoption_rate: float
    smart_home_adoption_rate: float
    online_shopping_rate: float
    last_updated: datetime

class InternetUsageByAge(BaseModel):
    age_group: str
    percentage: float
    users: int

class StreamingServicesByIncome(BaseModel):
    income_quartile: str
    netflix: float
    amazon: float
    disney: float
    other: float

class DigitalAdoptionByProvince(BaseModel):
    province: str
    smart_home: float
    online_shopping: float
    gov_services: float
    social_media: float

class ConnectionType(BaseModel):
    name: str
    value: float
    color: str

class MonthlyTrend(BaseModel):
    month: str
    internet_users: float
    streaming_users: float
    online_shoppers: float

class CanadaOpenDataDashboard(BaseModel):
    metrics: CanadaOpenDataMetrics
    internet_usage_by_age: List[InternetUsageByAge]
    streaming_services_by_income: List[StreamingServicesByIncome]
    digital_adoption_by_province: List[DigitalAdoptionByProvince]
    connection_types: List[ConnectionType]
    monthly_trends: List[MonthlyTrend]
    available_datasets: List[Dataset]
