'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
  Alert,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  ArrowBack as ArrowBackIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface QuestionnaireData {
  campaign_name: string
  business_goals: string[]
  target_action: string
  budget_range: string
  campaign_duration: string
  seasonality: string
  target_audience_description: string
  audience_demographics: {
    age_range: string
    gender: string
    income_level: string
    education: string
  }
  audience_interests: string[]
  audience_pain_points: string[]
  main_competitors: string[]
  competitive_advantage: string
  market_conditions: string
  product_category: string
  price_point: string
  unique_selling_proposition: string
  brand_tone: string
  key_messages: string[]
  creative_preferences: string[]
  website_quality: string
  tracking_setup: string
  conversion_tracking: boolean
  previous_campaigns: string
  success_metrics: string[]
  expected_timeline: string
}

interface AnalysisResult {
  overall_score: number
  gap_scores: {
    audience: number
    creative: number
    budget: number
    timing: number
    technical: number
  }
  recommendations: {
    high_priority: Array<{
      category: string
      action: string
      expected_impact: string
      effort: string
      timeline: string
    }>
    medium_priority: Array<{
      category: string
      action: string
      expected_impact: string
      effort: string
      timeline: string
    }>
    quick_wins: Array<{
      category: string
      action: string
      expected_impact: string
      effort: string
      timeline: string
    }>
  }
  performance_gaps: {
    [key: string]: {
      type: string
      description: string
      impact: string
      current_value: number
      predicted_value: number
      gap_percentage: number
    }
  }
  confidence_level: number
  priority_actions: string[]
}

const steps = ['Campaign Details', 'Target Audience', 'Market Analysis', 'Technical Setup', 'Review & Analyze']

const businessGoalsOptions = [
  'Brand Awareness',
  'Website Traffic', 
  'Lead Generation',
  'Sales/Conversions',
  'Customer Engagement',
  'App Downloads',
  'Local Store Visits'
]

const budgetRanges = ['$500-1K', '$1K-5K', '$5K-10K', '$10K-25K', '$25K+']
const durationOptions = ['1-2 weeks', '1 month', '2-3 months', '6 months', 'Ongoing']
const successMetricsOptions = [
  'Click-through Rate (CTR)',
  'Conversion Rate', 
  'Return on Ad Spend (ROAS)',
  'Cost per Acquisition (CPA)',
  'Impressions/Reach',
  'Engagement Rate',
  'Brand Awareness Lift'
]

export default function CampaignAnalyzerPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeStep, setActiveStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [formData, setFormData] = useState<QuestionnaireData>({
    campaign_name: '',
    business_goals: [],
    target_action: '',
    budget_range: '',
    campaign_duration: '',
    seasonality: '',
    target_audience_description: '',
    audience_demographics: {
      age_range: '',
      gender: '',
      income_level: '',
      education: ''
    },
    audience_interests: [],
    audience_pain_points: [],
    main_competitors: [],
    competitive_advantage: '',
    market_conditions: '',
    product_category: '',
    price_point: '',
    unique_selling_proposition: '',
    brand_tone: '',
    key_messages: [],
    creative_preferences: [],
    website_quality: '',
    tracking_setup: '',
    conversion_tracking: false,
    previous_campaigns: '',
    success_metrics: [],
    expected_timeline: ''
  })

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof QuestionnaireData] as object || {}),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleArrayInputChange = (field: string, value: string) => {
    if (value.trim()) {
      const items = value.split(',').map(item => item.trim())
      setFormData(prev => ({
        ...prev,
        [field]: items
      }))
    }
  }

  // Check for campaign parameter from campaigns portfolio
  useEffect(() => {
    const campaignId = searchParams.get('campaign')
    if (campaignId) {
      setSelectedCampaignId(campaignId)
      // TODO: Load campaign data from API
      // For now, just set the campaign name
      setFormData(prev => ({ ...prev, campaign_name: `Campaign ${campaignId}` }))
    }
  }, [searchParams])

  const handleNext = () => {
    setActiveStep(prev => prev + 1)
  }

  const handleBack = () => {
    setActiveStep(prev => prev - 1)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate API call for analysis
      setTimeout(() => {
        const mockResult: AnalysisResult = {
          overall_score: 78.5,
          gap_scores: {
            audience: 85,
            creative: 72,
            budget: 80,
            timing: 75,
            technical: 65
          },
          recommendations: {
            high_priority: [
              {
                category: "Technical Setup",
                action: "Implement enhanced conversion tracking",
                expected_impact: "25-30% better optimization",
                effort: "medium",
                timeline: "1-2 weeks"
              },
              {
                category: "Audience Targeting", 
                action: "Add lookalike audiences based on existing customers",
                expected_impact: "15-20% improvement in conversion rate",
                effort: "low",
                timeline: "1 week"
              }
            ],
            medium_priority: [
              {
                category: "Creative Strategy",
                action: "Develop mobile-first ad creatives",
                expected_impact: "10-15% better mobile performance",
                effort: "medium",
                timeline: "2-3 weeks"
              }
            ],
            quick_wins: [
              {
                category: "Budget Optimization",
                action: "Increase mobile bid adjustments by 20%",
                expected_impact: "5-10% more mobile conversions",
                effort: "low",
                timeline: "immediate"
              }
            ]
          },
          performance_gaps: {
            traffic: {
              type: "opportunity",
              description: "Campaign could significantly increase qualified traffic",
              impact: "high",
              current_value: 1250,
              predicted_value: 2100,
              gap_percentage: 68
            },
            conversions: {
              type: "optimization",
              description: "Conversion rate optimization needed",
              impact: "medium",
              current_value: 2.3,
              predicted_value: 3.8,
              gap_percentage: 65
            }
          },
          confidence_level: 0.87,
          priority_actions: [
            "Implement enhanced conversion tracking",
            "Add lookalike audiences",
            "Increase mobile bid adjustments",
            "Optimize landing page for mobile",
            "Set up automated bidding strategy"
          ]
        }
        setAnalysisResult(mockResult)
        setIsAnalyzing(false)
      }, 3000)
    } catch (error) {
      console.error('Analysis failed:', error)
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e' // green
    if (score >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <ErrorIcon color="error" />
      case 'medium': return <WarningIcon color="warning" />
      case 'low': return <InfoIcon color="info" />
      default: return <InfoIcon />
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Campaign Overview</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={formData.campaign_name}
                onChange={(e) => handleInputChange('campaign_name', e.target.value)}
                placeholder="Enter a descriptive name for your campaign"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Business Goals</InputLabel>
                <Select
                  multiple
                  value={formData.business_goals}
                  onChange={(e) => handleInputChange('business_goals', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {businessGoalsOptions.map((goal) => (
                    <MenuItem key={goal} value={goal}>{goal}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target Action"
                value={formData.target_action}
                onChange={(e) => handleInputChange('target_action', e.target.value)}
                placeholder="What specific action do you want users to take?"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Budget Range</InputLabel>
                <Select
                  value={formData.budget_range}
                  onChange={(e) => handleInputChange('budget_range', e.target.value)}
                >
                  {budgetRanges.map((range) => (
                    <MenuItem key={range} value={range}>{range}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Campaign Duration</InputLabel>
                <Select
                  value={formData.campaign_duration}
                  onChange={(e) => handleInputChange('campaign_duration', e.target.value)}
                >
                  {durationOptions.map((duration) => (
                    <MenuItem key={duration} value={duration}>{duration}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Seasonal Considerations"
                value={formData.seasonality}
                onChange={(e) => handleInputChange('seasonality', e.target.value)}
                placeholder="Are there seasonal factors that affect your business?"
              />
            </Grid>
          </Grid>
        )

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Target Audience</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Audience Description"
                value={formData.target_audience_description}
                onChange={(e) => handleInputChange('target_audience_description', e.target.value)}
                placeholder="Describe your ideal customer in detail..."
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age Range"
                value={formData.audience_demographics.age_range}
                onChange={(e) => handleInputChange('audience_demographics.age_range', e.target.value)}
                placeholder="e.g., 25-45"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.audience_demographics.gender}
                  onChange={(e) => handleInputChange('audience_demographics.gender', e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Audience Interests"
                placeholder="Enter interests separated by commas (e.g., fitness, technology, travel)"
                onChange={(e) => handleArrayInputChange('audience_interests', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Audience Pain Points"
                placeholder="What problems does your audience face? (separated by commas)"
                onChange={(e) => handleArrayInputChange('audience_pain_points', e.target.value)}
              />
            </Grid>
          </Grid>
        )

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Market Analysis</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Main Competitors"
                placeholder="List your main competitors (separated by commas)"
                onChange={(e) => handleArrayInputChange('main_competitors', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Competitive Advantage"
                value={formData.competitive_advantage}
                onChange={(e) => handleInputChange('competitive_advantage', e.target.value)}
                placeholder="What sets you apart from competitors?"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product/Service Category"
                value={formData.product_category}
                onChange={(e) => handleInputChange('product_category', e.target.value)}
                placeholder="e.g., SaaS, E-commerce, Healthcare"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Unique Selling Proposition"
                value={formData.unique_selling_proposition}
                onChange={(e) => handleInputChange('unique_selling_proposition', e.target.value)}
                placeholder="What's your unique value proposition?"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Key Messages"
                placeholder="Enter key messaging themes (separated by commas)"
                onChange={(e) => handleArrayInputChange('key_messages', e.target.value)}
              />
            </Grid>
          </Grid>
        )

      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Technical Setup</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Website Quality</InputLabel>
                <Select
                  value={formData.website_quality}
                  onChange={(e) => handleInputChange('website_quality', e.target.value)}
                >
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="average">Average</MenuItem>
                  <MenuItem value="poor">Needs Improvement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tracking Setup</InputLabel>
                <Select
                  value={formData.tracking_setup}
                  onChange={(e) => handleInputChange('tracking_setup', e.target.value)}
                >
                  <MenuItem value="comprehensive">Comprehensive</MenuItem>
                  <MenuItem value="basic">Basic</MenuItem>
                  <MenuItem value="minimal">Minimal</MenuItem>
                  <MenuItem value="none">No tracking</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.conversion_tracking}
                    onChange={(e) => handleInputChange('conversion_tracking', e.target.checked)}
                  />
                }
                label="Conversion tracking is properly set up"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Previous Campaign Experience"
                value={formData.previous_campaigns}
                onChange={(e) => handleInputChange('previous_campaigns', e.target.value)}
                placeholder="Describe any previous campaign experience..."
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Success Metrics</InputLabel>
                <Select
                  multiple
                  value={formData.success_metrics}
                  onChange={(e) => handleInputChange('success_metrics', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {successMetricsOptions.map((metric) => (
                    <MenuItem key={metric} value={metric}>{metric}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )

      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Review Your Campaign</Typography>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>{formData.campaign_name}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Goals: {formData.business_goals.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Budget: {formData.budget_range} | Duration: {formData.campaign_duration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Target Action: {formData.target_action}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Audience: {formData.target_audience_description.substring(0, 100)}...
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            {!isAnalyzing && !analysisResult && (
              <Grid item xs={12}>
                <Alert severity="info">
                  <Typography variant="body2">
                    Ready to analyze your campaign? We'll compare your setup with Google Analytics 4 data 
                    and provide actionable insights to improve your campaign performance.
                  </Typography>
                </Alert>
              </Grid>
            )}

            {isAnalyzing && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AnalyticsIcon sx={{ fontSize: 48, color: '#f97316', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Analyzing Your Campaign
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Comparing your campaign setup with GA4 data and generating insights...
                    </Typography>
                    <LinearProgress sx={{ mt: 2 }} />
                  </Box>
                </Paper>
              </Grid>
            )}

            {analysisResult && (
              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AnalyticsIcon color="primary" />
                    Campaign Analysis Results
                  </Typography>
                  
                  {/* Overall Score */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ color: getScoreColor(analysisResult.overall_score), fontWeight: 'bold' }}>
                          {analysisResult.overall_score}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          Overall Campaign Readiness Score
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Confidence Level: {Math.round(analysisResult.confidence_level * 100)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Gap Scores */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Area Breakdown</Typography>
                      <Grid container spacing={2}>
                        {Object.entries(analysisResult.gap_scores).map(([area, score]) => (
                          <Grid item xs={12} sm={6} md={2.4} key={area}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ color: getScoreColor(score) }}>
                                {score}
                              </Typography>
                              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                {area}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>

                  {/* Performance Gaps */}
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Performance Gaps vs GA4 Data</Typography>
                      {Object.entries(analysisResult.performance_gaps).map(([key, gap]) => (
                        <Alert 
                          key={key}
                          severity={gap.type === 'opportunity' ? 'success' : 'warning'}
                          sx={{ mb: 2 }}
                        >
                          <Typography variant="subtitle2">{gap.description}</Typography>
                          <Typography variant="body2">
                            Current: {gap.current_value} → Predicted: {gap.predicted_value} 
                            ({gap.gap_percentage > 0 ? '+' : ''}{gap.gap_percentage}% change)
                          </Typography>
                        </Alert>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Recommendations</Typography>
                      
                      {/* Priority Actions */}
                      <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ErrorIcon color="error" />
                            High Priority Actions
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List>
                            {analysisResult.recommendations.high_priority.map((rec, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <LightbulbIcon color="warning" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={rec.action}
                                  secondary={`${rec.category} • ${rec.expected_impact} • ${rec.timeline}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>

                      <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon color="success" />
                            Quick Wins
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List>
                            {analysisResult.recommendations.quick_wins.map((rec, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <TrendingUpIcon color="success" />
                                </ListItemIcon>
                                <ListItemText
                                  primary={rec.action}
                                  secondary={`${rec.category} • ${rec.expected_impact} • ${rec.timeline}`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            )}
          </Grid>
        )

      default:
        return null
    }
  }

  const isStepComplete = () => {
    switch (activeStep) {
      case 0:
        return formData.campaign_name && formData.business_goals.length > 0 && 
               formData.target_action && formData.budget_range && formData.campaign_duration
      case 1:
        return formData.target_audience_description
      case 2:
        return formData.competitive_advantage && formData.product_category && 
               formData.unique_selling_proposition
      case 3:
        return formData.website_quality && formData.tracking_setup && formData.previous_campaigns &&
               formData.success_metrics.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {selectedCampaignId && (
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/dashboard/campaigns')}
              sx={{ color: '#6b7280' }}
            >
              Back to Campaigns
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Campaign Analyzer
            </Typography>
            {selectedCampaignId && (
              <Chip
                icon={<CampaignIcon />}
                label={`Analyzing: ${formData.campaign_name}`}
                sx={{ bgcolor: '#f97316', color: 'white', fontWeight: 'bold' }}
              />
            )}
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Analyze your campaign setup against GA4 data to identify gaps and opportunities
        </Typography>
      </Box>

      {/* Stepper */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || analysisResult !== null}
                  sx={{ bgcolor: '#f97316' }}
                >
                  {isAnalyzing ? 'Analyzing...' : analysisResult ? 'Analysis Complete' : 'Start Analysis'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepComplete()}
                  sx={{ bgcolor: '#f97316' }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

