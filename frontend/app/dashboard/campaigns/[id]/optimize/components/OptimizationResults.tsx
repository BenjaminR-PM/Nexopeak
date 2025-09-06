'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Target, 
  DollarSign, 
  Users, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb,
  BarChart3,
  Zap,
  ArrowRight,
  Star,
  ThumbsUp,
  Download,
  Share
} from 'lucide-react';

interface ConfidenceScores {
  overall: number;
  timing: number;
  platform: number;
  budget: number;
}

interface TimingRecommendation {
  immediate_launch: boolean;
  optimal_launch_date: string;
  alternative_dates: string[];
  avoid_periods: number[];
  seasonal_multiplier: number;
  confidence_level: number;
  reasoning: string;
}

interface PlatformRecommendation {
  primary_platform: string;
  secondary_platforms: string[];
  platform_scores: Record<string, any>;
  channel_mix: Record<string, number>;
  budget_allocation: Record<string, number>;
  reasoning: string;
}

interface BudgetRecommendation {
  recommended_total_budget: number;
  recommended_daily_budget: number;
  budget_pacing: string;
  platform_allocation: Record<string, number>;
  seasonal_adjustments: Record<string, any>;
}

interface Recommendations {
  timing: TimingRecommendation;
  platforms: PlatformRecommendation;
  budget: BudgetRecommendation;
  creative: any;
  audience: any;
  confidence_scores: ConfidenceScores;
}

interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  platform: string;
  total_budget?: number;
  start_date?: string;
}

interface OptimizationResultsProps {
  campaignId: string;
  optimizationId: string;
  campaign: Campaign;
}

export default function OptimizationResults({
  campaignId,
  optimizationId,
  campaign
}: OptimizationResultsProps) {
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applyingRecommendations, setApplyingRecommendations] = useState(false);
  const [selectedRecommendations, setSelectedRecommendations] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchRecommendations();
  }, [optimizationId]);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/optimizations/${optimizationId}/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      setError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const applyRecommendations = async () => {
    if (Object.keys(selectedRecommendations).length === 0) {
      alert('Please select at least one recommendation to apply');
      return;
    }

    setApplyingRecommendations(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/optimizations/${optimizationId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedRecommendations),
      });

      if (response.ok) {
        alert('Recommendations applied successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to apply recommendations');
      }
    } catch (err) {
      setError('Failed to apply recommendations');
    } finally {
      setApplyingRecommendations(false);
    }
  };

  const toggleRecommendation = (category: string, recommendation: any) => {
    setSelectedRecommendations(prev => {
      const newSelected = { ...prev };
      if (newSelected[category]) {
        delete newSelected[category];
      } else {
        newSelected[category] = recommendation;
      }
      return newSelected;
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return 'High Confidence';
    if (score >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!recommendations) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No recommendations available yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Overall Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">
                Optimization Complete!
              </h2>
              <p className="text-blue-700">
                We've analyzed your campaign and generated personalized recommendations
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-900 mb-1">
                {Math.round(recommendations.confidence_scores.overall * 100)}%
              </div>
              <div className="text-sm text-blue-700">Overall Confidence</div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 bg-white rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-sm">Timing</div>
              <Badge className={getConfidenceColor(recommendations.confidence_scores.timing)}>
                {Math.round(recommendations.confidence_scores.timing * 100)}%
              </Badge>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg">
              <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="font-semibold text-sm">Platforms</div>
              <Badge className={getConfidenceColor(recommendations.confidence_scores.platform)}>
                {Math.round(recommendations.confidence_scores.platform * 100)}%
              </Badge>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-sm">Budget</div>
              <Badge className={getConfidenceColor(recommendations.confidence_scores.budget)}>
                {Math.round(recommendations.confidence_scores.budget * 100)}%
              </Badge>
            </div>
            
            <div className="text-center p-3 bg-white rounded-lg">
              <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-sm">Audience</div>
              <Badge className="text-blue-600 bg-blue-50">
                Optimized
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Tabs */}
      <Tabs defaultValue="timing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timing" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timing
          </TabsTrigger>
          <TabsTrigger value="platforms" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Platforms
          </TabsTrigger>
          <TabsTrigger value="budget" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience
          </TabsTrigger>
        </TabsList>

        {/* Timing Recommendations */}
        <TabsContent value="timing" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    Optimal Launch Timing
                  </CardTitle>
                  <CardDescription>
                    Based on market conditions, seasonal patterns, and historical data
                  </CardDescription>
                </div>
                <Badge className={getConfidenceColor(recommendations.confidence_scores.timing)}>
                  {getConfidenceLabel(recommendations.confidence_scores.timing)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {recommendations.timing.immediate_launch ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Launch Immediately:</strong> Market conditions are favorable for launching now.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Recommended Launch Date</h4>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mb-2">
                    {formatDate(recommendations.timing.optimal_launch_date)}
                  </div>
                  <p className="text-blue-700 text-sm">
                    This timing optimizes for seasonal patterns and market conditions
                  </p>
                </div>
              )}

              {recommendations.timing.reasoning && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Why This Timing?
                  </h4>
                  <p className="text-gray-700 text-sm">{recommendations.timing.reasoning}</p>
                </div>
              )}

              {recommendations.timing.alternative_dates.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Alternative Launch Dates</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {recommendations.timing.alternative_dates.map((date, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium">{formatDate(date)}</div>
                        <div className="text-sm text-gray-600">Alternative option</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Seasonal multiplier: {recommendations.timing.seasonal_multiplier}x
                </div>
                <Button
                  variant={selectedRecommendations.timing ? "default" : "outline"}
                  onClick={() => toggleRecommendation('timing', recommendations.timing)}
                >
                  {selectedRecommendations.timing ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select This Recommendation'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Recommendations */}
        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Platform & Channel Strategy
                  </CardTitle>
                  <CardDescription>
                    Optimized platform selection based on your audience and objectives
                  </CardDescription>
                </div>
                <Badge className={getConfidenceColor(recommendations.confidence_scores.platform)}>
                  {getConfidenceLabel(recommendations.confidence_scores.platform)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Star className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Primary Platform</h4>
                  </div>
                  <div className="text-xl font-bold text-green-900 capitalize mb-2">
                    {recommendations.platforms.primary_platform.replace('_', ' ')}
                  </div>
                  <p className="text-green-700 text-sm">
                    Best fit for your audience and campaign objectives
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Secondary Platforms</h4>
                  <div className="space-y-2">
                    {recommendations.platforms.secondary_platforms.map((platform, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="capitalize text-blue-800">
                          {platform.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-blue-600">
                          #{index + 2}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Recommended Budget Allocation</h4>
                <div className="space-y-3">
                  {Object.entries(recommendations.platforms.budget_allocation).map(([platform, percentage]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="capitalize">{platform.replace('_', ' ')}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(percentage as number) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {Math.round((percentage as number) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {recommendations.platforms.reasoning && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Why These Platforms?
                  </h4>
                  <p className="text-gray-700 text-sm">{recommendations.platforms.reasoning}</p>
                </div>
              )}

              <div className="flex items-center justify-end pt-4 border-t">
                <Button
                  variant={selectedRecommendations.platforms ? "default" : "outline"}
                  onClick={() => toggleRecommendation('platforms', recommendations.platforms)}
                >
                  {selectedRecommendations.platforms ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select This Recommendation'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Recommendations */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                    Budget Optimization
                  </CardTitle>
                  <CardDescription>
                    Optimized budget allocation for maximum ROI
                  </CardDescription>
                </div>
                <Badge className={getConfidenceColor(recommendations.confidence_scores.budget)}>
                  {getConfidenceLabel(recommendations.confidence_scores.budget)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-3">Recommended Budget</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-purple-700">Total Campaign Budget</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {formatCurrency(recommendations.budget.recommended_total_budget)}
                      </div>
                      {campaign.total_budget && (
                        <div className="text-sm text-purple-600">
                          Current: {formatCurrency(campaign.total_budget)}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="text-sm text-purple-700">Daily Budget</div>
                      <div className="text-xl font-bold text-purple-900">
                        {formatCurrency(recommendations.budget.recommended_daily_budget)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3">Budget Pacing</h4>
                  <div className="text-lg font-medium text-blue-800 capitalize mb-2">
                    {recommendations.budget.budget_pacing.replace('_', ' ')} Pacing
                  </div>
                  <p className="text-blue-700 text-sm">
                    Recommended spending distribution over campaign duration
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Platform Budget Allocation</h4>
                <div className="space-y-3">
                  {Object.entries(recommendations.budget.platform_allocation).map(([platform, percentage]) => {
                    const amount = recommendations.budget.recommended_total_budget * (percentage as number);
                    return (
                      <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="capitalize font-medium">{platform.replace('_', ' ')}</span>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(amount)}</div>
                          <div className="text-sm text-gray-600">
                            {Math.round((percentage as number) * 100)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end pt-4 border-t">
                <Button
                  variant={selectedRecommendations.budget ? "default" : "outline"}
                  onClick={() => toggleRecommendation('budget', recommendations.budget)}
                >
                  {selectedRecommendations.budget ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Selected
                    </>
                  ) : (
                    'Select This Recommendation'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Recommendations */}
        <TabsContent value="audience" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-600" />
                Audience Optimization
              </CardTitle>
              <CardDescription>
                Refined targeting recommendations for better performance
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Audience recommendations will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Apply Recommendations</h3>
              <p className="text-sm text-gray-600">
                {Object.keys(selectedRecommendations).length} of 4 recommendations selected
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              
              <Button variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share Results
              </Button>
              
              <Button
                onClick={applyRecommendations}
                disabled={applyingRecommendations || Object.keys(selectedRecommendations).length === 0}
                className="min-w-[140px]"
              >
                {applyingRecommendations ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Applying...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Apply Selected
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
