import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    RunReportRequest, DateRange, Metric, Dimension, Filter
)
from googleapiclient.discovery import build
from pytrends.request import TrendReq
import pandas as pd
import json

from app.core.config import settings
from app.models.connection import Connection
from app.services.bigquery_service import BigQueryService

logger = logging.getLogger(__name__)

class ETLService:
    def __init__(self):
        self.bigquery_service = BigQueryService()
        self.pytrends = TrendReq(hl='en-US', tz=360)
        
    async def process_ga4_data(self, connection: Connection, date: str) -> Dict[str, Any]:
        """Process GA4 data for a specific date."""
        try:
            logger.info(f"Processing GA4 data for {date}")
            
            # Get GA4 client
            ga4_client = await self._get_ga4_client(connection)
            if not ga4_client:
                raise Exception("Failed to create GA4 client")
            
            # Fetch data from GA4
            data = await self._fetch_ga4_data(ga4_client, connection, date)
            
            # Transform and clean data
            transformed_data = self._transform_ga4_data(data, connection.org_id)
            
            # Load to BigQuery
            await self.bigquery_service.load_ga4_data(transformed_data, date)
            
            # Update connection sync status
            connection.update_sync_status("success")
            
            logger.info(f"GA4 data processing completed for {date}")
            return {"status": "success", "records_processed": len(transformed_data)}
            
        except Exception as e:
            logger.error(f"GA4 data processing failed for {date}: {e}")
            connection.update_sync_status("error", str(e))
            raise
    
    async def process_search_console_data(self, connection: Connection, date: str) -> Dict[str, Any]:
        """Process Search Console data for a specific date."""
        try:
            logger.info(f"Processing Search Console data for {date}")
            
            # Get Search Console client
            gsc_client = await self._get_search_console_client(connection)
            if not gsc_client:
                raise Exception("Failed to create Search Console client")
            
            # Fetch data from Search Console
            data = await self._fetch_search_console_data(gsc_client, connection, date)
            
            # Transform and clean data
            transformed_data = self._transform_search_console_data(data, connection.org_id)
            
            # Load to BigQuery
            await self.bigquery_service.load_search_console_data(transformed_data, date)
            
            # Update connection sync status
            connection.update_sync_status("success")
            
            logger.info(f"Search Console data processing completed for {date}")
            return {"status": "success", "records_processed": len(transformed_data)}
            
        except Exception as e:
            logger.error(f"Search Console data processing failed for {date}: {e}")
            connection.update_sync_status("error", str(e))
            raise
    
    async def process_google_trends_data(self, keywords: List[str], geo: str = "CA") -> Dict[str, Any]:
        """Process Google Trends data for specified keywords."""
        try:
            logger.info(f"Processing Google Trends data for {len(keywords)} keywords")
            
            trends_data = []
            for keyword in keywords:
                try:
                    # Build payload
                    self.pytrends.build_payload([keyword], timeframe='today 12-m', geo=geo)
                    
                    # Get interest over time
                    interest_data = self.pytrends.interest_over_time()
                    
                    if not interest_data.empty:
                        # Get latest interest value
                        latest_interest = interest_data[keyword].iloc[-1]
                        
                        trends_data.append({
                            "keyword": keyword,
                            "geo_code": geo,
                            "interest": int(latest_interest),
                            "date": datetime.now().strftime("%Y-%m-%d")
                        })
                        
                except Exception as e:
                    logger.warning(f"Failed to process keyword '{keyword}': {e}")
                    continue
            
            # Load to BigQuery
            if trends_data:
                await self.bigquery_service.load_trends_data(trends_data)
            
            logger.info(f"Google Trends data processing completed for {len(trends_data)} keywords")
            return {"status": "success", "records_processed": len(trends_data)}
            
        except Exception as e:
            logger.error(f"Google Trends data processing failed: {e}")
            raise
    
    async def _get_ga4_client(self, connection: Connection):
        """Get GA4 client using connection credentials."""
        try:
            # Get OAuth tokens from connection
            oauth_tokens = connection.oauth_tokens
            if not oauth_tokens:
                raise Exception("No OAuth tokens found")
            
            # Create credentials from tokens
            credentials = service_account.Credentials.from_service_account_info(
                json.loads(oauth_tokens.refresh_token_enc),
                scopes=['https://www.googleapis.com/auth/analytics.readonly']
            )
            
            return BetaAnalyticsDataClient(credentials=credentials)
            
        except Exception as e:
            logger.error(f"Failed to create GA4 client: {e}")
            return None
    
    async def _get_search_console_client(self, connection: Connection):
        """Get Search Console client using connection credentials."""
        try:
            # Get OAuth tokens from connection
            oauth_tokens = connection.oauth_tokens
            if not oauth_tokens:
                raise Exception("No OAuth tokens found")
            
            # Create credentials from tokens
            credentials = service_account.Credentials.from_service_account_info(
                json.loads(oauth_tokens.refresh_token_enc),
                scopes=['https://www.googleapis.com/auth/webmasters.readonly']
            )
            
            return build('searchconsole', 'v1', credentials=credentials)
            
        except Exception as e:
            logger.error(f"Failed to create Search Console client: {e}")
            return None
    
    async def _fetch_ga4_data(self, client, connection: Connection, date: str) -> List[Dict]:
        """Fetch data from GA4 API."""
        try:
            # Get property ID from connection metadata
            property_id = connection.get_metadata("property_id")
            if not property_id:
                raise Exception("Property ID not found in connection metadata")
            
            # Create date range
            date_range = DateRange(
                start_date=date,
                end_date=date
            )
            
            # Define metrics and dimensions
            metrics = [
                Metric(name="sessions"),
                Metric(name="engagedSessions"),
                Metric(name="totalUsers"),
                Metric(name="newUsers"),
                Metric(name="conversions"),
                Metric(name="averageEngagementTime")
            ]
            
            dimensions = [
                Dimension(name="date"),
                Dimension(name="country"),
                Dimension(name="region"),
                Dimension(name="city"),
                Dimension(name="deviceCategory"),
                Dimension(name="source"),
                Dimension(name="medium"),
                Dimension(name="defaultChannelGroup"),
                Dimension(name="landingPage")
            ]
            
            # Create request
            request = RunReportRequest(
                property=f"properties/{property_id}",
                date_ranges=[date_range],
                metrics=metrics,
                dimensions=dimensions
            )
            
            # Execute request
            response = client.run_report(request)
            
            # Parse response
            data = []
            for row in response.rows:
                row_data = {}
                for i, dimension in enumerate(row.dimension_values):
                    row_data[dimensions[i].name] = dimension.value
                for i, metric in enumerate(row.metric_values):
                    row_data[metrics[i].name] = metric.value
                data.append(row_data)
            
            return data
            
        except Exception as e:
            logger.error(f"Failed to fetch GA4 data: {e}")
            raise
    
    async def _fetch_search_console_data(self, client, connection: Connection, date: str) -> List[Dict]:
        """Fetch data from Search Console API."""
        try:
            # Get site URL from connection metadata
            site_url = connection.get_metadata("site_url")
            if not site_url:
                raise Exception("Site URL not found in connection metadata")
            
            # Create request
            request = {
                'startDate': date,
                'endDate': date,
                'dimensions': ['query', 'page', 'country', 'device'],
                'rowLimit': 25000
            }
            
            # Execute request
            response = client.searchAnalytics().query(
                siteUrl=site_url,
                body=request
            ).execute()
            
            return response.get('rows', [])
            
        except Exception as e:
            logger.error(f"Failed to fetch Search Console data: {e}")
            raise
    
    def _transform_ga4_data(self, data: List[Dict], org_id: str) -> List[Dict]:
        """Transform GA4 data into standardized format."""
        transformed = []
        
        for row in data:
            transformed_row = {
                "org_id": org_id,
                "date": row.get("date"),
                "country": row.get("country"),
                "region": row.get("region"),
                "city": row.get("city"),
                "device_category": row.get("deviceCategory"),
                "source": row.get("source"),
                "medium": row.get("medium"),
                "channel_group": row.get("defaultChannelGroup"),
                "landing_page": row.get("landingPage"),
                "sessions": int(row.get("sessions", 0)),
                "engaged_sessions": int(row.get("engagedSessions", 0)),
                "total_users": int(row.get("totalUsers", 0)),
                "new_users": int(row.get("newUsers", 0)),
                "conversions": int(row.get("conversions", 0)),
                "avg_engagement_time": float(row.get("averageEngagementTime", 0))
            }
            transformed.append(transformed_row)
        
        return transformed
    
    def _transform_search_console_data(self, data: List[Dict], org_id: str) -> List[Dict]:
        """Transform Search Console data into standardized format."""
        transformed = []
        
        for row in data:
            transformed_row = {
                "org_id": org_id,
                "date": row.get("date"),
                "query": row.get("keys", [""])[0] if row.get("keys") else "",
                "page": row.get("keys", ["", ""])[1] if len(row.get("keys", [])) > 1 else "",
                "country": row.get("keys", ["", "", ""])[2] if len(row.get("keys", [])) > 2 else "",
                "device": row.get("keys", ["", "", "", ""])[3] if len(row.get("keys", [])) > 3 else "",
                "clicks": int(row.get("clicks", 0)),
                "impressions": int(row.get("impressions", 0)),
                "ctr": float(row.get("ctr", 0)),
                "position": float(row.get("position", 0))
            }
            transformed.append(transformed_row)
        
        return transformed
