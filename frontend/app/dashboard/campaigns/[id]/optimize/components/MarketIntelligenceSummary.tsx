'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Users,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface MarketIntelligence {
  industry: string;
  geography: string;
  economic_outlook: {
    retail_sales?: {
      trend: string;
      change_percentage: number;
      impact_level: string;
    };
    consumer_confidence?: {
      trend: string;
      change_percentage: number;
    };
  };
  seasonal_patterns: {
    peak_months?: number[];
    low_months?: number[];
    seasonal_strength?: number;
  };
  consumer_behavior: {
    digital_adoption?: {
      rate: number;
      growth: number;
    };
    spending_patterns?: {
      online_preference: number;
    };
  };
  timing_insights: {
    optimal_launch_window?: {
      start_month: number;
      end_month: number;
      confidence: number;
    };
    avoid_periods?: number[];
  };
  last_updated?: string;
}

export default function MarketIntelligenceSummary() {
  const [marketData, setMarketData] = useState<MarketIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketIntelligence();
  }, []);

  const fetchMarketIntelligence = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/market-intelligence`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMarketData(data);
      } else {
        setError('Failed to load market data');
      }
    } catch (err) {
      setError('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthNumber: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[monthNumber - 1] || '';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !marketData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Market Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Market data unavailable</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Market Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Market</span>
            <Badge variant="outline" className="text-xs">
              {marketData.geography}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Industry</span>
            <span className="text-sm capitalize">{marketData.industry}</span>
          </div>
        </div>

        {/* Economic Indicators */}
        {marketData.economic_outlook && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Economic Outlook
            </h4>
            
            {marketData.economic_outlook.retail_sales && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {getTrendIcon(marketData.economic_outlook.retail_sales.trend)}
                  <span className="text-sm">Retail Sales</span>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getTrendColor(marketData.economic_outlook.retail_sales.trend)}`}>
                    {marketData.economic_outlook.retail_sales.change_percentage > 0 ? '+' : ''}
                    {marketData.economic_outlook.retail_sales.change_percentage.toFixed(1)}%
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      marketData.economic_outlook.retail_sales.impact_level === 'high' 
                        ? 'border-red-300 text-red-600' 
                        : 'border-yellow-300 text-yellow-600'
                    }`}
                  >
                    {marketData.economic_outlook.retail_sales.impact_level} impact
                  </Badge>
                </div>
              </div>
            )}

            {marketData.economic_outlook.consumer_confidence && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {getTrendIcon(marketData.economic_outlook.consumer_confidence.trend)}
                  <span className="text-sm">Consumer Confidence</span>
                </div>
                <div className={`text-sm font-medium ${getTrendColor(marketData.economic_outlook.consumer_confidence.trend)}`}>
                  {marketData.economic_outlook.consumer_confidence.change_percentage > 0 ? '+' : ''}
                  {marketData.economic_outlook.consumer_confidence.change_percentage.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seasonal Patterns */}
        {marketData.seasonal_patterns && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              Seasonal Patterns
            </h4>
            
            {marketData.seasonal_patterns.peak_months && marketData.seasonal_patterns.peak_months.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Peak Months</span>
                  <div className="flex gap-1">
                    {marketData.seasonal_patterns.peak_months.slice(0, 3).map(month => (
                      <Badge key={month} variant="default" className="text-xs">
                        {getMonthName(month)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {marketData.seasonal_patterns.low_months && marketData.seasonal_patterns.low_months.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Low Months</span>
                  <div className="flex gap-1">
                    {marketData.seasonal_patterns.low_months.slice(0, 3).map(month => (
                      <Badge key={month} variant="outline" className="text-xs">
                        {getMonthName(month)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {marketData.seasonal_patterns.seasonal_strength !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Seasonal Impact</span>
                <Badge 
                  variant={marketData.seasonal_patterns.seasonal_strength > 0.5 ? "default" : "outline"}
                  className="text-xs"
                >
                  {marketData.seasonal_patterns.seasonal_strength > 0.5 ? 'High' : 'Low'}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Consumer Behavior */}
        {marketData.consumer_behavior && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Consumer Behavior
            </h4>
            
            {marketData.consumer_behavior.digital_adoption && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Digital Adoption</span>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {(marketData.consumer_behavior.digital_adoption.rate * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-green-600">
                    +{(marketData.consumer_behavior.digital_adoption.growth * 100).toFixed(0)}% growth
                  </div>
                </div>
              </div>
            )}

            {marketData.consumer_behavior.spending_patterns && (
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">Online Preference</span>
                <div className="text-sm font-medium">
                  {(marketData.consumer_behavior.spending_patterns.online_preference * 100).toFixed(0)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Timing Insights */}
        {marketData.timing_insights && marketData.timing_insights.optimal_launch_window && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Optimal Launch Window</h4>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {getMonthName(marketData.timing_insights.optimal_launch_window.start_month)} - {getMonthName(marketData.timing_insights.optimal_launch_window.end_month)}
                </span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">
                  {Math.round(marketData.timing_insights.optimal_launch_window.confidence * 100)}% confidence
                </Badge>
              </div>
              <p className="text-xs text-blue-700">
                Based on historical patterns and market conditions
              </p>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {marketData.last_updated && (
          <div className="pt-3 border-t">
            <div className="text-xs text-gray-500">
              Last updated: {new Date(marketData.last_updated).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
