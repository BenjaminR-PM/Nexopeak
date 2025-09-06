import logging
import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from app.models.campaign_optimization import MarketIntelligence
from app.models.organization import Organization
from app.core.config import settings

logger = logging.getLogger(__name__)

class MarketIntelligenceService:
    """Service for gathering market intelligence from Canadian data sources"""
    
    def __init__(self, db: Session):
        self.db = db
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # Canadian data source endpoints
        self.data_sources = {
            "statistics_canada": {
                "base_url": "https://www150.statcan.gc.ca/t1/wds/rest",
                "endpoints": {
                    "retail_sales": "/getDataFromVectorsAndLatestNPeriods",
                    "consumer_price_index": "/getDataFromVectorsAndLatestNPeriods",
                    "employment": "/getDataFromVectorsAndLatestNPeriods"
                }
            },
            "bank_of_canada": {
                "base_url": "https://www.bankofcanada.ca/valet",
                "endpoints": {
                    "exchange_rates": "/observations/group/FX_RATES_DAILY/json",
                    "interest_rates": "/observations/IRATE_V39079/json",
                    "commodity_prices": "/observations/group/COMMODITY_PRICE_INDEXES/json"
                }
            }
        }
        
        # Key economic indicators that affect marketing campaigns
        self.key_indicators = {
            "retail_sales": {
                "statcan_vectors": ["v41692457", "v41692458", "v41692459"],  # Total retail sales
                "description": "Monthly retail sales data",
                "impact": "high"
            },
            "consumer_confidence": {
                "statcan_vectors": ["v41690973"],  # Consumer confidence index
                "description": "Consumer confidence levels",
                "impact": "high"
            },
            "employment_rate": {
                "statcan_vectors": ["v2057673", "v2057674"],  # Employment rate
                "description": "Employment statistics",
                "impact": "medium"
            },
            "inflation_rate": {
                "statcan_vectors": ["v41690914"],  # CPI all items
                "description": "Consumer price index",
                "impact": "medium"
            }
        }

    async def get_market_intelligence(
        self, 
        industry: str, 
        geography: str = "Canada",
        lookback_months: int = 12
    ) -> Dict[str, Any]:
        """Get comprehensive market intelligence for a specific industry and geography"""
        try:
            logger.info(f"Gathering market intelligence for {industry} in {geography}")
            
            # Check for cached data first
            cached_data = await self._get_cached_intelligence(industry, geography)
            if cached_data:
                logger.info("Using cached market intelligence data")
                return cached_data
            
            # Gather data from multiple sources
            intelligence_data = {}
            
            # Get economic indicators
            economic_data = await self._get_economic_indicators(lookback_months)
            intelligence_data["economic_indicators"] = economic_data
            
            # Get retail sales trends
            retail_data = await self._get_retail_trends(industry, lookback_months)
            intelligence_data["retail_trends"] = retail_data
            
            # Get seasonal patterns
            seasonal_data = await self._analyze_seasonal_patterns(industry, lookback_months)
            intelligence_data["seasonal_patterns"] = seasonal_data
            
            # Get consumer behavior insights
            consumer_data = await self._get_consumer_behavior_data(industry, geography)
            intelligence_data["consumer_behavior"] = consumer_data
            
            # Calculate market timing recommendations
            timing_insights = await self._calculate_timing_insights(intelligence_data)
            intelligence_data["timing_insights"] = timing_insights
            
            # Cache the results
            await self._cache_intelligence_data(industry, geography, intelligence_data)
            
            logger.info(f"Market intelligence gathered successfully for {industry}")
            return intelligence_data
            
        except Exception as e:
            logger.error(f"Failed to gather market intelligence: {e}")
            return await self._get_fallback_intelligence_data(industry, geography)

    async def _get_economic_indicators(self, lookback_months: int) -> Dict[str, Any]:
        """Fetch key economic indicators from Statistics Canada"""
        try:
            indicators_data = {}
            
            for indicator_name, config in self.key_indicators.items():
                try:
                    # Fetch data from Statistics Canada
                    data = await self._fetch_statcan_data(
                        config["statcan_vectors"], 
                        lookback_months
                    )
                    
                    if data:
                        indicators_data[indicator_name] = {
                            "data": data,
                            "description": config["description"],
                            "impact_level": config["impact"],
                            "trend": self._calculate_trend(data),
                            "latest_value": data[-1] if data else None,
                            "change_percentage": self._calculate_change_percentage(data)
                        }
                        
                except Exception as e:
                    logger.warning(f"Failed to fetch {indicator_name}: {e}")
                    continue
            
            return indicators_data
            
        except Exception as e:
            logger.error(f"Failed to get economic indicators: {e}")
            return {}

    async def _fetch_statcan_data(self, vectors: List[str], periods: int) -> List[Dict[str, Any]]:
        """Fetch data from Statistics Canada API"""
        try:
            # Statistics Canada API endpoint
            url = f"{self.data_sources['statistics_canada']['base_url']}/getDataFromVectorsAndLatestNPeriods"
            
            # Prepare request parameters
            params = {
                "vectorIds": ",".join(vectors),
                "latestN": periods,
                "format": "json"
            }
            
            response = await self.client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                return self._process_statcan_response(data)
            else:
                logger.warning(f"StatCan API returned status {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Failed to fetch StatCan data: {e}")
            return []

    def _process_statcan_response(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process Statistics Canada API response"""
        try:
            processed_data = []
            
            if "object" in data and "vectorDataPoint" in data["object"]:
                for point in data["object"]["vectorDataPoint"]:
                    processed_data.append({
                        "date": point.get("refPer"),
                        "value": float(point.get("value", 0)),
                        "vector_id": point.get("vectorId"),
                        "status": point.get("releaseTime")
                    })
            
            # Sort by date
            processed_data.sort(key=lambda x: x["date"])
            return processed_data
            
        except Exception as e:
            logger.error(f"Failed to process StatCan response: {e}")
            return []

    async def _get_retail_trends(self, industry: str, lookback_months: int) -> Dict[str, Any]:
        """Get retail sales trends specific to industry"""
        try:
            # Industry-specific retail vectors
            industry_vectors = self._get_industry_vectors(industry)
            
            retail_data = await self._fetch_statcan_data(industry_vectors, lookback_months)
            
            if not retail_data:
                return self._get_fallback_retail_data(industry)
            
            return {
                "monthly_sales": retail_data,
                "growth_rate": self._calculate_growth_rate(retail_data),
                "seasonal_index": self._calculate_seasonal_index(retail_data),
                "trend_direction": self._calculate_trend(retail_data),
                "volatility": self._calculate_volatility(retail_data)
            }
            
        except Exception as e:
            logger.error(f"Failed to get retail trends: {e}")
            return self._get_fallback_retail_data(industry)

    def _get_industry_vectors(self, industry: str) -> List[str]:
        """Get Statistics Canada vector IDs for specific industries"""
        industry_mapping = {
            "retail": ["v41692457", "v41692458"],
            "technology": ["v41692460", "v41692461"],
            "healthcare": ["v41692462", "v41692463"],
            "finance": ["v41692464", "v41692465"],
            "education": ["v41692466", "v41692467"],
            "automotive": ["v41692468", "v41692469"],
            "real_estate": ["v41692470", "v41692471"],
            "food_beverage": ["v41692472", "v41692473"],
            "default": ["v41692457", "v41692458"]  # General retail
        }
        
        return industry_mapping.get(industry.lower(), industry_mapping["default"])

    async def _analyze_seasonal_patterns(self, industry: str, lookback_months: int) -> Dict[str, Any]:
        """Analyze seasonal patterns for the industry"""
        try:
            # Get historical data for seasonal analysis
            retail_data = await self._get_retail_trends(industry, min(lookback_months, 36))  # Up to 3 years
            
            if not retail_data.get("monthly_sales"):
                return self._get_fallback_seasonal_data(industry)
            
            monthly_data = retail_data["monthly_sales"]
            seasonal_analysis = self._perform_seasonal_decomposition(monthly_data)
            
            return {
                "peak_months": seasonal_analysis["peak_months"],
                "low_months": seasonal_analysis["low_months"],
                "seasonal_strength": seasonal_analysis["seasonal_strength"],
                "recommended_launch_months": seasonal_analysis["recommended_months"],
                "avoid_months": seasonal_analysis["avoid_months"],
                "seasonal_multipliers": seasonal_analysis["multipliers"]
            }
            
        except Exception as e:
            logger.error(f"Failed to analyze seasonal patterns: {e}")
            return self._get_fallback_seasonal_data(industry)

    def _perform_seasonal_decomposition(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform seasonal decomposition analysis"""
        try:
            # Group data by month
            monthly_averages = {}
            for point in data:
                month = datetime.strptime(point["date"], "%Y-%m").month
                if month not in monthly_averages:
                    monthly_averages[month] = []
                monthly_averages[month].append(point["value"])
            
            # Calculate monthly averages
            month_stats = {}
            for month, values in monthly_averages.items():
                month_stats[month] = {
                    "average": sum(values) / len(values),
                    "count": len(values)
                }
            
            # Calculate overall average
            overall_avg = sum(stats["average"] for stats in month_stats.values()) / len(month_stats)
            
            # Calculate seasonal indices
            seasonal_indices = {}
            for month, stats in month_stats.items():
                seasonal_indices[month] = stats["average"] / overall_avg
            
            # Identify patterns
            sorted_months = sorted(seasonal_indices.items(), key=lambda x: x[1], reverse=True)
            
            return {
                "peak_months": [month for month, index in sorted_months[:3]],
                "low_months": [month for month, index in sorted_months[-3:]],
                "seasonal_strength": max(seasonal_indices.values()) - min(seasonal_indices.values()),
                "recommended_months": [month for month, index in sorted_months[:6]],
                "avoid_months": [month for month, index in sorted_months[-2:]],
                "multipliers": seasonal_indices
            }
            
        except Exception as e:
            logger.error(f"Failed to perform seasonal decomposition: {e}")
            return self._get_default_seasonal_analysis()

    async def _get_consumer_behavior_data(self, industry: str, geography: str) -> Dict[str, Any]:
        """Get consumer behavior insights from Canada Open Data"""
        try:
            # Use existing Canada Open Data integration
            consumer_data = await self._fetch_canada_open_data_insights(industry, geography)
            
            return {
                "digital_adoption": consumer_data.get("digital_adoption", {}),
                "spending_patterns": consumer_data.get("spending_patterns", {}),
                "demographic_preferences": consumer_data.get("demographics", {}),
                "platform_usage": consumer_data.get("platform_usage", {}),
                "seasonal_behavior": consumer_data.get("seasonal_behavior", {})
            }
            
        except Exception as e:
            logger.error(f"Failed to get consumer behavior data: {e}")
            return self._get_fallback_consumer_data(industry)

    async def _calculate_timing_insights(self, intelligence_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate optimal timing insights based on all gathered data"""
        try:
            timing_insights = {
                "optimal_launch_window": self._calculate_optimal_launch_window(intelligence_data),
                "avoid_periods": self._identify_avoid_periods(intelligence_data),
                "economic_factors": self._analyze_economic_timing_factors(intelligence_data),
                "seasonal_recommendations": self._get_seasonal_timing_recommendations(intelligence_data),
                "confidence_score": self._calculate_timing_confidence(intelligence_data)
            }
            
            return timing_insights
            
        except Exception as e:
            logger.error(f"Failed to calculate timing insights: {e}")
            return self._get_default_timing_insights()

    # Helper methods for calculations
    def _calculate_trend(self, data: List[Dict[str, Any]]) -> str:
        """Calculate trend direction from time series data"""
        if len(data) < 2:
            return "insufficient_data"
        
        values = [point["value"] for point in data[-6:]]  # Last 6 periods
        if len(values) < 2:
            return "insufficient_data"
        
        trend_slope = (values[-1] - values[0]) / len(values)
        
        if trend_slope > 0.01:
            return "increasing"
        elif trend_slope < -0.01:
            return "decreasing"
        else:
            return "stable"

    def _calculate_change_percentage(self, data: List[Dict[str, Any]]) -> float:
        """Calculate percentage change from previous period"""
        if len(data) < 2:
            return 0.0
        
        current = data[-1]["value"]
        previous = data[-2]["value"]
        
        if previous == 0:
            return 0.0
        
        return ((current - previous) / previous) * 100

    def _calculate_growth_rate(self, data: List[Dict[str, Any]]) -> float:
        """Calculate compound growth rate"""
        if len(data) < 2:
            return 0.0
        
        first_value = data[0]["value"]
        last_value = data[-1]["value"]
        periods = len(data) - 1
        
        if first_value <= 0 or periods <= 0:
            return 0.0
        
        return (pow(last_value / first_value, 1/periods) - 1) * 100

    # Fallback data methods
    async def _get_cached_intelligence(self, industry: str, geography: str) -> Optional[Dict[str, Any]]:
        """Check for cached market intelligence data"""
        try:
            cached = self.db.query(MarketIntelligence).filter(
                and_(
                    MarketIntelligence.industry == industry,
                    MarketIntelligence.geography == geography,
                    MarketIntelligence.created_at > datetime.utcnow() - timedelta(hours=24)
                )
            ).first()
            
            if cached and not cached.is_expired:
                return {
                    "economic_indicators": cached.indicators,
                    "retail_trends": cached.trends,
                    "seasonal_patterns": cached.seasonal_patterns,
                    "market_data": cached.market_data
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Failed to get cached intelligence: {e}")
            return None

    async def _cache_intelligence_data(self, industry: str, geography: str, data: Dict[str, Any]):
        """Cache market intelligence data"""
        try:
            intelligence = MarketIntelligence(
                industry=industry,
                geography=geography,
                data_source="multiple",
                data_type="comprehensive",
                market_data=data,
                indicators=data.get("economic_indicators", {}),
                trends=data.get("retail_trends", {}),
                seasonal_patterns=data.get("seasonal_patterns", {}),
                data_period_start=datetime.utcnow() - timedelta(days=365),
                data_period_end=datetime.utcnow(),
                expires_at=datetime.utcnow() + timedelta(hours=24),
                confidence_score=0.85
            )
            
            self.db.add(intelligence)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Failed to cache intelligence data: {e}")

    async def _get_fallback_intelligence_data(self, industry: str, geography: str) -> Dict[str, Any]:
        """Provide fallback data when APIs are unavailable"""
        return {
            "economic_indicators": {
                "retail_sales": {
                    "trend": "stable",
                    "change_percentage": 2.1,
                    "impact_level": "medium"
                }
            },
            "retail_trends": {
                "growth_rate": 1.8,
                "trend_direction": "increasing",
                "seasonal_index": 1.0
            },
            "seasonal_patterns": self._get_fallback_seasonal_data(industry),
            "consumer_behavior": self._get_fallback_consumer_data(industry),
            "timing_insights": self._get_default_timing_insights(),
            "data_quality": "fallback",
            "last_updated": datetime.utcnow().isoformat()
        }

    def _get_fallback_seasonal_data(self, industry: str) -> Dict[str, Any]:
        """Fallback seasonal data based on industry patterns"""
        industry_patterns = {
            "retail": {
                "peak_months": [11, 12, 1],  # Nov, Dec, Jan
                "low_months": [2, 3, 8],
                "recommended_launch_months": [9, 10, 11]
            },
            "technology": {
                "peak_months": [1, 9, 10],  # Jan, Sep, Oct
                "low_months": [6, 7, 8],
                "recommended_launch_months": [8, 9, 12]
            },
            "default": {
                "peak_months": [3, 4, 9],
                "low_months": [1, 7, 8],
                "recommended_launch_months": [2, 3, 8, 9]
            }
        }
        
        pattern = industry_patterns.get(industry.lower(), industry_patterns["default"])
        return {
            **pattern,
            "seasonal_strength": 0.3,
            "avoid_months": pattern["low_months"][:2],
            "seasonal_multipliers": {i: 1.0 for i in range(1, 13)}
        }

    def _get_fallback_consumer_data(self, industry: str) -> Dict[str, Any]:
        """Fallback consumer behavior data"""
        return {
            "digital_adoption": {"rate": 0.78, "growth": 0.12},
            "spending_patterns": {"online_preference": 0.65},
            "demographic_preferences": {"primary_age_group": "25-44"},
            "platform_usage": {"mobile": 0.68, "desktop": 0.32}
        }

    def _get_default_timing_insights(self) -> Dict[str, Any]:
        """Default timing insights"""
        return {
            "optimal_launch_window": {
                "start_month": 3,
                "end_month": 5,
                "confidence": 0.7
            },
            "avoid_periods": [7, 8],
            "economic_factors": {"favorable": True, "risk_level": "low"},
            "confidence_score": 0.6
        }

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
