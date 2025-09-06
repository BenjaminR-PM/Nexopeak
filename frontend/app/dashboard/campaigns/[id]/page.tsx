'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Edit, 
  Play, 
  Pause, 
  BarChart3, 
  Zap,
  Calendar,
  DollarSign,
  Target,
  Users,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  campaign_type: string;
  platform: string;
  status: string;
  primary_objective: string;
  secondary_objectives: string[];
  total_budget?: number;
  daily_budget?: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  target_demographics: any;
  target_locations: string[];
  target_interests: string[];
  created_at: string;
  updated_at: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/campaigns/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      } else {
        setError('Failed to load campaign');
      }
    } catch (err) {
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error || 'Campaign not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/campaigns')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
          </div>
          {campaign.description && (
            <p className="text-gray-600">{campaign.description}</p>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Campaign
          </Button>
          
          <Button
            onClick={() => router.push(`/dashboard/campaigns/${campaignId}/optimize`)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <Zap className="h-4 w-4 mr-2" />
            Optimize Campaign
          </Button>
        </div>
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Core campaign configuration and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Campaign Type</label>
                  <p className="text-lg font-semibold capitalize">{campaign.campaign_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Platform</label>
                  <p className="text-lg font-semibold capitalize">{campaign.platform}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Primary Objective</label>
                  <p className="text-lg font-semibold capitalize">{campaign.primary_objective.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Currency</label>
                  <p className="text-lg font-semibold">{campaign.currency}</p>
                </div>
              </div>

              {campaign.secondary_objectives.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Secondary Objectives</label>
                  <div className="flex flex-wrap gap-2">
                    {campaign.secondary_objectives.map((objective, index) => (
                      <Badge key={index} variant="outline">
                        {objective.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget & Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Budget & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {campaign.total_budget && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Total Budget</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency(campaign.total_budget, campaign.currency)}
                    </div>
                  </div>
                )}

                {campaign.daily_budget && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Daily Budget</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatCurrency(campaign.daily_budget, campaign.currency)}
                    </div>
                  </div>
                )}

                {campaign.start_date && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Start Date</span>
                    </div>
                    <div className="text-lg font-semibold text-purple-900">
                      {formatDate(campaign.start_date)}
                    </div>
                  </div>
                )}

                {campaign.end_date && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">End Date</span>
                    </div>
                    <div className="text-lg font-semibold text-orange-900">
                      {formatDate(campaign.end_date)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-600" />
                Targeting & Audience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.target_locations.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Target Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {campaign.target_locations.map((location, index) => (
                      <Badge key={index} variant="outline">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {campaign.target_interests.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Target Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {campaign.target_interests.map((interest, index) => (
                      <Badge key={index} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(campaign.target_demographics).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Demographics</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <pre className="text-sm text-gray-700">
                      {JSON.stringify(campaign.target_demographics, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => router.push(`/dashboard/campaigns/${campaignId}/optimize`)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Zap className="h-4 w-4 mr-2" />
                Optimize Campaign
              </Button>
              
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              
              <Button variant="outline" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance Report
              </Button>
              
              {campaign.status === 'active' ? (
                <Button variant="outline" className="w-full">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Campaign
                </Button>
              ) : (
                <Button variant="outline" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Start Campaign
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Campaign Info */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm">{formatDate(campaign.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-sm">{formatDate(campaign.updated_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Campaign ID</label>
                <p className="text-sm font-mono text-gray-500">{campaign.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Optimization CTA */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Optimize Your Campaign
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Get AI-powered recommendations for better performance, optimal timing, and platform selection.
                  </p>
                  <Button
                    onClick={() => router.push(`/dashboard/campaigns/${campaignId}/optimize`)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Start Optimization
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
