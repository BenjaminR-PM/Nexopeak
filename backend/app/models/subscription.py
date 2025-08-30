from sqlalchemy import Column, String, DateTime, Boolean, Float, Integer, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
from datetime import datetime, timedelta

class SubscriptionPlan(Base):
    __tablename__ = "subscription_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)  # Basic, Professional, Enterprise
    description = Column(Text, nullable=True)
    price_monthly = Column(Float, nullable=False)
    price_yearly = Column(Float, nullable=True)
    currency = Column(String(3), default="USD", nullable=False)
    
    # Plan limits
    max_users = Column(Integer, nullable=True)  # null = unlimited
    max_ga4_properties = Column(Integer, nullable=True)  # null = unlimited
    max_api_calls_per_month = Column(Integer, nullable=True)
    max_data_retention_days = Column(Integer, default=365, nullable=False)
    
    # Features
    features = Column(JSON, default=[], nullable=False)  # List of feature names
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    subscriptions = relationship("Subscription", back_populates="plan")

    def __repr__(self):
        return f"<SubscriptionPlan(id={self.id}, name='{self.name}', price=${self.price_monthly})>"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String(36), ForeignKey("orgs.id"), nullable=False)
    plan_id = Column(String(36), ForeignKey("subscription_plans.id"), nullable=False)
    
    # Subscription details
    status = Column(String(20), default="active", nullable=False)  # active, cancelled, expired, trial
    billing_cycle = Column(String(10), default="monthly", nullable=False)  # monthly, yearly
    
    # Dates
    start_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    trial_end_date = Column(DateTime(timezone=True), nullable=True)
    next_billing_date = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    
    # Billing
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    
    # External payment provider data
    stripe_subscription_id = Column(String(255), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)
    payment_method_id = Column(String(255), nullable=True)
    
    # Usage tracking
    current_users = Column(Integer, default=0, nullable=False)
    current_ga4_properties = Column(Integer, default=0, nullable=False)
    api_calls_this_month = Column(Integer, default=0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="subscription")
    plan = relationship("SubscriptionPlan", back_populates="subscriptions")
    invoices = relationship("Invoice", back_populates="subscription")

    def __repr__(self):
        return f"<Subscription(id={self.id}, org_id={self.org_id}, status='{self.status}')>"

    @property
    def is_active(self) -> bool:
        return self.status == "active"

    @property
    def is_trial(self) -> bool:
        return self.status == "trial"

    @property
    def is_expired(self) -> bool:
        if self.end_date:
            return datetime.utcnow() > self.end_date
        return False

    @property
    def days_until_renewal(self) -> int:
        if self.next_billing_date:
            delta = self.next_billing_date - datetime.utcnow()
            return max(0, delta.days)
        return 0


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    subscription_id = Column(String(36), ForeignKey("subscriptions.id"), nullable=False)
    
    # Invoice details
    invoice_number = Column(String(50), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending, paid, failed, cancelled
    
    # Dates
    invoice_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=False)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    
    # Period covered by this invoice
    period_start = Column(DateTime(timezone=True), nullable=False)
    period_end = Column(DateTime(timezone=True), nullable=False)
    
    # External payment data
    stripe_invoice_id = Column(String(255), nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    
    # Invoice details
    line_items = Column(JSON, default=[], nullable=False)  # Detailed breakdown
    tax_amount = Column(Float, default=0.0, nullable=False)
    discount_amount = Column(Float, default=0.0, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    subscription = relationship("Subscription", back_populates="invoices")

    def __repr__(self):
        return f"<Invoice(id={self.id}, number='{self.invoice_number}', amount=${self.amount}, status='{self.status}')>"

    @property
    def is_paid(self) -> bool:
        return self.status == "paid"

    @property
    def is_overdue(self) -> bool:
        if self.status != "paid" and self.due_date:
            return datetime.utcnow() > self.due_date
        return False
