'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Calendar, 
  DollarSign, 
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Zap
} from 'lucide-react';

import OptimizationQuestionnaire from './components/OptimizationQuestionnaire';
import OptimizationResults from './components/OptimizationResults';
import MarketIntelligenceSummary from './components/MarketIntelligenceSummary';

interface OptimizationStatus {
  id: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  processing_time?: number;
  confidence_scores?: {
    overall: number;
    timing: number;
    platform: number;
    budget: number;
  };
}

interface Campaign {
  id: string;
  name: string;
  campaign_type: string;
  platform: string;
  status: string;
  total_budget?: number;
  start_date?: string;
  primary_objective: string;
}

export default function CampaignOptimizationPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [currentStep, setCurrentStep] = useState<'intro' | 'questionnaire' | 'analyzing' | 'results'>('intro');
  const [optimization, setOptimization] = useState<OptimizationStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaign();
    checkExistingOptimization();
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
    }
  };

  const checkExistingOptimization = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/campaigns/${campaignId}/optimize/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const latestOptimization = data.optimization_history[0];
        
        if (latestOptimization) {
          setOptimization(latestOptimization);
          
          if (latestOptimization.status === 'completed') {
            setCurrentStep('results');
          } else if (latestOptimization.status === 'analyzing') {
            setCurrentStep('analyzing');
            pollOptimizationStatus(latestOptimization.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to check existing optimization:', err);
    }
  };

  const startOptimization = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/campaigns/${campaignId}/optimize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          optimization_type: 'full'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOptimization(data);
        setCurrentStep('questionnaire');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to start optimization');
      }
    } catch (err) {
      setError('Failed to start optimization');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireSubmit = async (responses: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/campaigns/${campaignId}/optimize/questionnaire`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responses),
      });

      if (response.ok) {
        const data = await response.json();
        setOptimization(data);
        setCurrentStep('analyzing');
        
        // Start polling for completion
        pollOptimizationStatus(data.optimization_id);
      } else {
        const errorData = await response.json();
        setError(errorData.detail?.message || 'Failed to submit questionnaire');
      }
    } catch (err) {
      setError('Failed to submit questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const pollOptimizationStatus = async (optimizationId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/optimizations/${optimizationId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOptimization(data);

          if (data.status === 'completed') {
            clearInterval(pollInterval);
            setCurrentStep('results');
          } else if (data.status === 'failed') {
            clearInterval(pollInterval);
            setError('Optimization analysis failed. Please try again.');
            setCurrentStep('intro');
          }
        }
      } catch (err) {
        console.error('Failed to poll optimization status:', err);
      }
    }, 3000); // Poll every 3 seconds

    // Clear interval after 5 minutes to prevent infinite polling
    setTimeout(() => clearInterval(pollInterval), 300000);
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 'intro': return 0;
      case 'questionnaire': return 25;
      case 'analyzing': return 75;
      case 'results': return 100;
      default: return 0;
    }
  };

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>Campaigns</span>
          <ArrowRight className="h-4 w-4" />
          <span>{campaign.name}</span>
          <ArrowRight className="h-4 w-4" />
          <span>Optimize</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="h-8 w-8 text-blue-600" />
              Campaign Optimization
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered recommendations for optimal timing, platforms, and campaign settings
            </p>
          </div>
          
          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
            {campaign.status}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Optimization Progress</h3>
            <span className="text-sm text-gray-600">{getStepProgress()}% Complete</span>
          </div>
          <Progress value={getStepProgress()} className="mb-4" />
          
          <div className="flex justify-between text-sm">
            <div className={`flex items-center gap-2 ${currentStep === 'intro' ? 'text-blue-600 font-medium' : currentStep !== 'intro' ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="h-4 w-4" />
              Start
            </div>
            <div className={`flex items-center gap-2 ${currentStep === 'questionnaire' ? 'text-blue-600 font-medium' : getStepProgress() > 25 ? 'text-green-600' : 'text-gray-400'}`}>
              <Users className="h-4 w-4" />
              Questionnaire
            </div>
            <div className={`flex items-center gap-2 ${currentStep === 'analyzing' ? 'text-blue-600 font-medium' : getStepProgress() > 75 ? 'text-green-600' : 'text-gray-400'}`}>
              <BarChart3 className="h-4 w-4" />
              Analysis
            </div>
            <div className={`flex items-center gap-2 ${currentStep === 'results' ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
              <Lightbulb className="h-4 w-4" />
              Results
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {currentStep === 'intro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-blue-600" />
                  Intelligent Campaign Optimization
                </CardTitle>
                <CardDescription>
                  Get AI-powered recommendations to maximize your campaign performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Optimal Timing</h4>
                      <p className="text-sm text-blue-700">
                        Discover the best launch dates based on market conditions and seasonal patterns
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <Target className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-green-900">Platform Selection</h4>
                      <p className="text-sm text-green-700">
                        Identify the most effective platforms and channels for your audience
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-purple-900">Budget Optimization</h4>
                      <p className="text-sm text-purple-700">
                        Optimize budget allocation across platforms and time periods
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-orange-900">Performance Boost</h4>
                      <p className="text-sm text-orange-700">
                        Improve campaign performance with data-driven adjustments
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-3">What You'll Get:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Optimal launch timing with historical data backing
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Platform recommendations based on your audience
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Budget allocation suggestions across channels
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Creative and messaging optimization tips
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Audience targeting refinements
                    </li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={startOptimization} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Starting Analysis...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Start Optimization
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/dashboard/campaigns/${campaignId}`)}
                  >
                    Back to Campaign
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campaign Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Campaign Name</label>
                  <p className="font-semibold">{campaign.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="capitalize">{campaign.campaign_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Platform</label>
                  <p className="capitalize">{campaign.platform}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Objective</label>
                  <p className="capitalize">{campaign.primary_objective.replace('_', ' ')}</p>
                </div>
                {campaign.total_budget && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Budget</label>
                    <p className="font-semibold">${campaign.total_budget.toLocaleString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <MarketIntelligenceSummary />
          </div>
        </div>
      )}

      {currentStep === 'questionnaire' && (
        <OptimizationQuestionnaire
          campaignId={campaignId}
          onSubmit={handleQuestionnaireSubmit}
          loading={loading}
        />
      )}

      {currentStep === 'analyzing' && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Your Campaign</h3>
                <p className="text-gray-600 mb-4">
                  Our AI is processing market data, historical patterns, and your campaign details
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  Estimated completion: 1-2 minutes
                </div>
              </div>
              
              <div className="max-w-md mx-auto space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Analyzing market conditions</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span>Processing historical data</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-400 animate-spin" />
                  <span>Generating recommendations</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'results' && optimization && (
        <OptimizationResults
          campaignId={campaignId}
          optimizationId={optimization.id}
          campaign={campaign}
        />
      )}
    </div>
  );
}
