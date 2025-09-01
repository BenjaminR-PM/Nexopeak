from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Constants
DATA_WAREHOUSES_TABLE = "data_warehouses"
ORGANIZATIONS_TABLE = "organizations"

class DataWarehouse(Base):
    __tablename__ = "data_warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    provider = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text)
    api_url = Column(String(500))
    status = Column(String(50), default="active")  # active, inactive, coming_soon
    data_types = Column(JSON)  # Array of data type strings
    features = Column(JSON)  # Array of feature strings
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    connections = relationship("DataWarehouseConnection", back_populates="warehouse")
    datasets = relationship("Dataset", back_populates="warehouse")

class DataWarehouseConnection(Base):
    __tablename__ = "data_warehouse_connections"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey(f"{DATA_WAREHOUSES_TABLE}.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey(f"{ORGANIZATIONS_TABLE}.id"), nullable=False)
    connection_name = Column(String(255), nullable=False)
    api_key = Column(String(500))  # Encrypted API key if needed
    api_secret = Column(String(500))  # Encrypted API secret if needed
    connection_config = Column(JSON)  # Additional connection parameters
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime(timezone=True))
    sync_frequency = Column(String(50), default="daily")  # daily, weekly, monthly
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    warehouse = relationship("DataWarehouse", back_populates="connections")
    organization = relationship("Organization")

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey(f"{DATA_WAREHOUSES_TABLE}.id"), nullable=False)
    dataset_id = Column(String(255), nullable=False)  # External dataset ID
    name = Column(String(255), nullable=False)
    description = Column(Text)
    api_endpoint = Column(String(500))
    download_url = Column(String(500))
    record_count = Column(String(100))
    last_updated = Column(DateTime(timezone=True))
    data_schema = Column(JSON)  # Schema information
    sample_data = Column(JSON)  # Sample data for preview
    tags = Column(JSON)  # Array of tag strings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    warehouse = relationship("DataWarehouse", back_populates="datasets")

class DataWarehouseMetrics(Base):
    __tablename__ = "data_warehouse_metrics"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey(f"{DATA_WAREHOUSES_TABLE}.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey(f"{ORGANIZATIONS_TABLE}.id"), nullable=False)
    metric_name = Column(String(255), nullable=False)
    metric_value = Column(String(255))
    metric_data = Column(JSON)  # Detailed metric data
    date_recorded = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    warehouse = relationship("DataWarehouse")
    organization = relationship("Organization")
