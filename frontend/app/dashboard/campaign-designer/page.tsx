'use client'

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createCampaignFromDesigner, type CampaignDesignerData } from '@/lib/campaigns';
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, Slider,
  Stepper, Step, StepLabel, StepContent, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText,
  Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  AutoAwesome as SparklesIcon, Lightbulb as LightbulbIcon,
  Speed as SpeedIcon, ExpandMore as ExpandMoreIcon,
  ContentCopy as CopyIcon, Rocket as RocketIcon, Edit as EditIcon
} from '@mui/icons-material';

export const dynamic = 'force-dynamic';

// Campaign Templates
const campaignTemplates = [
  {
    id: 'lead-gen-b2b',
    name: 'B2B Lead Generation',
    description: 'Optimized for generating high-quality B2B leads with multi-touch attribution',
    objective: 'lead_gen',
    primaryKpi: 'CPL',
    channels: ['Search', 'LinkedIn', 'Meta'],
    budget: 15000,
    duration: 42,
    icon: '🎯',
    color: '#3b82f6'
  },
  {
    id: 'ecommerce-sales',
    name: 'E-commerce Sales',
    description: 'Drive online sales with performance-focused channel mix and retargeting',
    objective: 'ecommerce_sales',
    primaryKpi: 'ROAS',
    channels: ['Search', 'Meta', 'YouTube', 'Performance Max'],
    budget: 25000,
    duration: 30,
    icon: '🛒',
    color: '#10b981'
  },
  {
    id: 'brand-awareness',
    name: 'Brand Awareness',
    description: 'Build brand recognition and reach with video-first creative strategy',
    objective: 'awareness',
    primaryKpi: 'Reach',
    channels: ['YouTube', 'Meta', 'Display', 'TikTok'],
    budget: 20000,
    duration: 60,
    icon: '📢',
    color: '#8b5cf6'
  },
  {
    id: 'app-installs',
    name: 'Mobile App Growth',
    description: 'Drive app downloads and user acquisition across mobile-first channels',
    objective: 'app_installs',
    primaryKpi: 'CPA',
    channels: ['Meta', 'TikTok', 'YouTube', 'Search'],
    budget: 18000,
    duration: 35,
    icon: '📱',
    color: '#f59e0b'
  }
];

export default function CampaignDesignerPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Campaign Configuration State
  const [campaignName, setCampaignName] = useState('');
  const [objective, setObjective] = useState('lead_gen');
  const [primaryKpi, setPrimaryKpi] = useState('CPL');
  const [budget, setBudget] = useState(15000);
  const [dailyBudget, setDailyBudget] = useState(500);
  const [duration, setDuration] = useState(42);
  const [geo, setGeo] = useState(['CA-ON', 'CA-BC']);
  const [channels, setChannels] = useState(['Search', 'Meta', 'LinkedIn']);
  const [targetAudience, setTargetAudience] = useState('');
  const [kpiTarget, setKpiTarget] = useState(35);
  
  // Enhanced target audience fields
  const [audienceAge, setAudienceAge] = useState('25-54');
  const [audienceGender, setAudienceGender] = useState('all');
  const [audienceIncome, setAudienceIncome] = useState('middle');
  const [audienceInterests, setAudienceInterests] = useState<string[]>([]);
  const [audienceJobTitles, setAudienceJobTitles] = useState<string[]>([]);
  const [audienceIndustries, setAudienceIndustries] = useState<string[]>([]);

  // Budget validation and formatting
  const formatBudget = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    const number = parseFloat(numericValue);
    
    if (isNaN(number) || number <= 0) return '';
    
    // Format with commas
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const parseBudget = (formattedValue: string): number => {
    const numericValue = formattedValue.replace(/[^\d]/g, '');
    const number = parseInt(numericValue);
    return isNaN(number) || number <= 0 ? 0 : number;
  };

  const validateBudget = (value: number): boolean => {
    return value > 0;
  };

  // Geographic options
  const geoOptions = [
    { value: 'CA-ON', label: 'Ontario, Canada', country: 'Canada' },
    { value: 'CA-BC', label: 'British Columbia, Canada', country: 'Canada' },
    { value: 'CA-AB', label: 'Alberta, Canada', country: 'Canada' },
    { value: 'CA-QC', label: 'Quebec, Canada', country: 'Canada' },
    { value: 'US-CA', label: 'California, USA', country: 'United States' },
    { value: 'US-NY', label: 'New York, USA', country: 'United States' },
    { value: 'US-TX', label: 'Texas, USA', country: 'United States' },
    { value: 'US-FL', label: 'Florida, USA', country: 'United States' },
    { value: 'UK', label: 'United Kingdom', country: 'Europe' },
    { value: 'DE', label: 'Germany', country: 'Europe' },
    { value: 'FR', label: 'France', country: 'Europe' },
    { value: 'AU', label: 'Australia', country: 'Oceania' },
  ];

  // Audience interest options
  const interestOptions = [
    'Technology', 'Business & Finance', 'Marketing', 'Healthcare', 'Education',
    'E-commerce', 'Travel', 'Food & Dining', 'Fitness & Wellness', 'Entertainment',
    'Real Estate', 'Automotive', 'Fashion', 'Sports', 'Gaming', 'Music',
    'Art & Design', 'Photography', 'Books & Literature', 'Home & Garden'
  ];

  // Job title options
  const jobTitleOptions = [
    'CEO', 'CTO', 'CMO', 'VP Marketing', 'Marketing Manager', 'Digital Marketing Manager',
    'Product Manager', 'Sales Manager', 'Business Owner', 'Entrepreneur', 'Consultant',
    'Director', 'Manager', 'Analyst', 'Coordinator', 'Specialist', 'Executive',
    'Developer', 'Designer', 'Engineer', 'Researcher'
  ];

  // Industry options
  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing',
    'Real Estate', 'Consulting', 'Media & Entertainment', 'Travel & Hospitality',
    'Automotive', 'Energy', 'Non-profit', 'Government', 'Agriculture', 'Construction',
    'Transportation', 'Telecommunications', 'Food & Beverage', 'Fashion'
  ];

  // Real-time calculations
  const designScore = useMemo(() => {
    let score = 30; // Base score
    let feedback: string[] = [];
    
    // Objective-channel alignment (25 points)
    if (objective === 'lead_gen' && channels.includes('Search')) {
      score += 15;
      feedback.push('✓ Search is excellent for lead generation');
    }
    if (objective === 'ecommerce_sales' && channels.includes('Performance Max')) {
      score += 15;
      feedback.push('✓ Performance Max optimizes for e-commerce sales');
    }
    if (objective === 'awareness' && channels.includes('YouTube')) {
      score += 15;
      feedback.push('✓ YouTube is perfect for brand awareness');
    }
    if (objective === 'app_installs' && (channels.includes('Meta') || channels.includes('TikTok'))) {
      score += 15;
      feedback.push('✓ Social channels drive app installs effectively');
    }
    
    // Budget adequacy (20 points)
    if (budget >= 10000) {
      score += 10;
      feedback.push('✓ Budget is sufficient for meaningful results');
    } else if (budget >= 5000) {
      score += 5;
      feedback.push('⚠ Consider increasing budget for better performance');
    } else {
      feedback.push('⚠ Budget may be too low for optimal results');
    }
    
    if (validateBudget(budget) && validateBudget(dailyBudget) && dailyBudget * duration <= budget) {
      score += 10;
      feedback.push('✓ Budget allocation is mathematically sound');
    } else {
      feedback.push('⚠ Daily budget doesn\'t align with total budget and duration');
    }
    
    // Channel diversity (15 points)
    if (channels.length >= 3 && channels.length <= 5) {
      score += 15;
      feedback.push('✓ Good channel mix for diversified reach');
    } else if (channels.length >= 2) {
      score += 10;
      feedback.push('⚠ Consider adding more channels for better reach');
    } else if (channels.length === 1) {
      score += 5;
      feedback.push('⚠ Single channel campaigns have higher risk');
    } else {
      feedback.push('⚠ Please select at least one marketing channel');
    }
    
    // Audience targeting completeness (15 points)
    if (targetAudience && audienceInterests.length > 0) {
      score += 10;
      feedback.push('✓ Well-defined target audience');
    } else if (targetAudience) {
      score += 5;
      feedback.push('⚠ Add interests for better targeting');
    } else {
      feedback.push('⚠ Define your target audience');
    }
    
    if (audienceJobTitles.length > 0 || audienceIndustries.length > 0) {
      score += 5;
      feedback.push('✓ Professional targeting criteria defined');
    }
    
    // Geographic targeting (10 points)
    if (geo.length > 0 && geo.length <= 5) {
      score += 10;
      feedback.push('✓ Focused geographic targeting');
    } else if (geo.length > 5) {
      score += 5;
      feedback.push('⚠ Too many locations may dilute performance');
    } else {
      feedback.push('⚠ Select target geographic locations');
    }
    
    // Campaign duration appropriateness (10 points)
    if (duration >= 30 && duration <= 90) {
      score += 10;
      feedback.push('✓ Optimal campaign duration for learning and optimization');
    } else if (duration >= 14) {
      score += 5;
      feedback.push('⚠ Consider longer duration for better optimization');
    } else {
      feedback.push('⚠ Campaign duration may be too short for meaningful results');
    }
    
    // KPI target realism (5 points)
    if (kpiTarget > 0) {
      score += 5;
      feedback.push('✓ KPI target set');
    } else {
      feedback.push('⚠ Set a realistic KPI target');
    }
    
    return {
      score: Math.min(100, Math.max(0, score)),
      feedback
    };
  }, [objective, channels, budget, dailyBudget, duration, targetAudience, audienceInterests, audienceJobTitles, audienceIndustries, geo, kpiTarget]);

  const budgetAllocation = useMemo(() => {
    const weights: Record<string, number> = {
      'Search': objective === 'lead_gen' ? 0.4 : 0.3,
      'Meta': 0.25,
      'LinkedIn': objective === 'lead_gen' ? 0.2 : 0.15,
      'YouTube': objective === 'awareness' ? 0.3 : 0.15,
      'Performance Max': objective === 'ecommerce_sales' ? 0.3 : 0.1,
      'TikTok': 0.1,
      'Display': 0.1,
      'Email': 0.05,
      'SMS': 0.05
    };
    
    const activeChannels = channels.filter(c => weights[c]);
    const totalWeight = activeChannels.reduce((sum, c) => sum + weights[c], 0);
    
    return activeChannels.map(channel => ({
      channel,
      percentage: Math.round((weights[channel] / totalWeight) * 100),
      amount: Math.round((weights[channel] / totalWeight) * budget)
    }));
  }, [channels, objective, budget]);

  const steps = [
    'Choose Starting Point',
    'Campaign Basics', 
    'Budget & Timeline',
    'Channels & Targeting',
    'Review & Launch'
  ];

  const handleTemplateSelect = (templateId: string) => {
    const template = campaignTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setObjective(template.objective);
      setPrimaryKpi(template.primaryKpi);
      setChannels(template.channels);
      setBudget(template.budget);
      setDuration(template.duration);
      setDailyBudget(Math.round(template.budget / template.duration));
      setCampaignName(template.name);
    }
    setShowTemplateDialog(false);
    setActiveStep(1);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const toggleChannel = (channel: string) => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const generateCampaignPlan = () => {
    const plan: CampaignDesignerData = {
      name: campaignName,
      objective: objective as CampaignDesignerData['objective'],
      primaryKpi: primaryKpi as CampaignDesignerData['primaryKpi'],
      budget: {
        total: budget,
        daily: dailyBudget,
        duration: duration
      },
      channels: budgetAllocation,
      targeting: {
        geo,
        audience: targetAudience
      },
      kpiTarget,
      designScore: designScore.score,
      selectedTemplate: selectedTemplate || undefined,
      createdAt: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
  };

  const createCampaign = async () => {
    if (!campaignName || !targetAudience || channels.length === 0) {
      setError('Please complete all required fields');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const campaignData: CampaignDesignerData = {
        name: campaignName,
        objective: objective as CampaignDesignerData['objective'],
        primaryKpi: primaryKpi as CampaignDesignerData['primaryKpi'],
        budget: {
          total: budget,
          daily: dailyBudget,
          duration: duration
        },
        channels: budgetAllocation,
        targeting: {
          geo,
          audience: targetAudience
        },
        kpiTarget,
        designScore: designScore.score,
        selectedTemplate: selectedTemplate || undefined,
        createdAt: new Date().toISOString()
      };

      const campaign = await createCampaignFromDesigner(campaignData);
      
      // Redirect to campaigns page with success message
      router.push(`/dashboard/campaigns?created=${campaign.id}`);
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Campaign Designer
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Create optimized marketing campaigns with AI-powered recommendations
          {selectedTemplate && ` (Using ${selectedTemplate} template)`}
        </Typography>
        
        {/* Progress Indicator */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <LinearProgress 
            variant="determinate" 
            value={(activeStep / (steps.length - 1)) * 100} 
            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" sx={{ color: '#6b7280', minWidth: 'fit-content' }}>
            Step {activeStep + 1} of {steps.length}
          </Typography>
        </Box>
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ mb: 3 }}>
          <Card sx={{ bgcolor: '#fef2f2', borderColor: '#ef4444' }}>
            <CardContent>
              <Typography variant="body2" sx={{ color: '#ef4444' }}>
                {error}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Design Score Card */}
      {activeStep > 0 && (() => {
        const getScoreColor = () => {
          if (designScore.score >= 80) return '#3b82f6';
          if (designScore.score >= 60) return '#f59e0b';
          return '#ef4444';
        };
        
        const getScoreBgColor = () => {
          if (designScore.score >= 80) return '#f0f9ff';
          if (designScore.score >= 60) return '#fffbeb';
          return '#fef2f2';
        };
        
        const getScoreMessage = () => {
          if (designScore.score >= 80) return 'Excellent campaign setup!';
          if (designScore.score >= 60) return 'Good setup, consider optimizations';
          return 'Needs improvement for better performance';
        };
        
        return (
          <Card sx={{ mb: 4, bgcolor: getScoreBgColor() }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SpeedIcon sx={{ color: getScoreColor() }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Design Score: {designScore.score}/100
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                      {getScoreMessage()}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: getScoreColor() }}>
                    ${budget.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Total Budget
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })()}

      {/* Main Stepper */}
      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            
            {/* Step 1: Choose Starting Point */}
            <Step>
              <StepLabel>Choose Your Starting Point</StepLabel>
              <StepContent>
                <Typography variant="body1" sx={{ mb: 3, color: '#6b7280' }}>
                  Start with a proven template or build from scratch with AI guidance
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer', 
                        border: '2px solid transparent',
                        '&:hover': { borderColor: '#f97316' },
                        height: '100%'
                      }}
                      onClick={() => setShowTemplateDialog(true)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <LightbulbIcon sx={{ fontSize: 48, color: '#f97316', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Use Template
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Start with proven campaign templates optimized for your industry and goals
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer', 
                        border: '2px solid transparent',
                        '&:hover': { borderColor: '#f97316' },
                        height: '100%'
                      }}
                      onClick={() => setActiveStep(1)}
                    >
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <SparklesIcon sx={{ fontSize: 48, color: '#f97316', mb: 2 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Build from Scratch
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Create a custom campaign with AI-powered recommendations and optimization
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </StepContent>
            </Step>

            {/* Step 2: Campaign Basics */}
            <Step>
              <StepLabel>Campaign Basics</StepLabel>
              <StepContent>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Campaign Name"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g., Q1 Lead Generation Campaign"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Campaign Objective</InputLabel>
                      <Select
                        value={objective}
                        label="Campaign Objective"
                        onChange={(e) => setObjective(e.target.value)}
                      >
                        <MenuItem value="lead_gen">Lead Generation</MenuItem>
                        <MenuItem value="ecommerce_sales">E-commerce Sales</MenuItem>
                        <MenuItem value="app_installs">App Installs</MenuItem>
                        <MenuItem value="awareness">Brand Awareness</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="body2" sx={{ color: '#6b7280', mt: 1, fontSize: '0.875rem' }}>
                      {objective === 'lead_gen' && 'Focus on generating qualified leads through forms, calls, or inquiries. Best for B2B and service businesses.'}
                      {objective === 'ecommerce_sales' && 'Drive online purchases and revenue. Optimized for product catalogs and shopping experiences.'}
                      {objective === 'app_installs' && 'Increase mobile app downloads and user acquisition. Perfect for mobile-first businesses.'}
                      {objective === 'awareness' && 'Build brand recognition and reach new audiences. Ideal for new products or market expansion.'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Primary KPI</InputLabel>
                      <Select
                        value={primaryKpi}
                        label="Primary KPI"
                        onChange={(e) => setPrimaryKpi(e.target.value)}
                      >
                        <MenuItem value="CPL">Cost Per Lead (CPL)</MenuItem>
                        <MenuItem value="CPA">Cost Per Acquisition (CPA)</MenuItem>
                        <MenuItem value="ROAS">Return on Ad Spend (ROAS)</MenuItem>
                        <MenuItem value="CTR">Click-Through Rate (CTR)</MenuItem>
                        <MenuItem value="Reach">Reach & Impressions</MenuItem>
                      </Select>
                    </FormControl>
                    <Typography variant="body2" sx={{ color: '#6b7280', mt: 1, fontSize: '0.875rem' }}>
                      {primaryKpi === 'CPL' && 'Measures cost efficiency for lead generation. Lower CPL means more leads for your budget.'}
                      {primaryKpi === 'CPA' && 'Tracks cost per customer acquisition. Focus on converting leads to paying customers.'}
                      {primaryKpi === 'ROAS' && 'Return on Ad Spend - revenue generated per dollar spent. Target 3:1 or higher for profitability.'}
                      {primaryKpi === 'CTR' && 'Click-through rate measures ad engagement. Higher CTR indicates relevant, compelling ads.'}
                      {primaryKpi === 'Reach' && 'Total unique people who see your ads. Best for brand awareness and market penetration.'}
                    </Typography>
                  </Grid>
                  
                  {/* Enhanced Target Audience Section */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Target Audience Details
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Age Range</InputLabel>
                      <Select
                        value={audienceAge}
                        label="Age Range"
                        onChange={(e) => setAudienceAge(e.target.value)}
                      >
                        <MenuItem value="18-24">18-24 (Gen Z)</MenuItem>
                        <MenuItem value="25-34">25-34 (Younger Millennials)</MenuItem>
                        <MenuItem value="35-44">35-44 (Older Millennials)</MenuItem>
                        <MenuItem value="45-54">45-54 (Gen X)</MenuItem>
                        <MenuItem value="55-64">55-64 (Younger Boomers)</MenuItem>
                        <MenuItem value="65+">65+ (Older Adults)</MenuItem>
                        <MenuItem value="25-54">25-54 (Prime Working Age)</MenuItem>
                        <MenuItem value="all">All Ages</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={audienceGender}
                        label="Gender"
                        onChange={(e) => setAudienceGender(e.target.value)}
                      >
                        <MenuItem value="all">All Genders</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="non-binary">Non-binary</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Income Level</InputLabel>
                      <Select
                        value={audienceIncome}
                        label="Income Level"
                        onChange={(e) => setAudienceIncome(e.target.value)}
                      >
                        <MenuItem value="low">Lower Income ($0-$40K)</MenuItem>
                        <MenuItem value="middle">Middle Income ($40K-$100K)</MenuItem>
                        <MenuItem value="upper-middle">Upper Middle ($100K-$200K)</MenuItem>
                        <MenuItem value="high">High Income ($200K+)</MenuItem>
                        <MenuItem value="all">All Income Levels</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Interests (Select Multiple)</InputLabel>
                      <Select
                        multiple
                        value={audienceInterests}
                        label="Interests (Select Multiple)"
                        onChange={(e) => setAudienceInterests(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {interestOptions.map((interest) => (
                          <MenuItem key={interest} value={interest}>
                            {interest}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Job Titles (B2B)</InputLabel>
                      <Select
                        multiple
                        value={audienceJobTitles}
                        label="Job Titles (B2B)"
                        onChange={(e) => setAudienceJobTitles(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {jobTitleOptions.map((title) => (
                          <MenuItem key={title} value={title}>
                            {title}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Industries</InputLabel>
                      <Select
                        multiple
                        value={audienceIndustries}
                        label="Industries"
                        onChange={(e) => setAudienceIndustries(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value} label={value} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {industryOptions.map((industry) => (
                          <MenuItem key={industry} value={industry}>
                            {industry}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Audience Description"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., Small business owners looking for productivity tools, tech-savvy early adopters"
                      multiline
                      rows={2}
                      helperText="Describe any specific characteristics, behaviors, or motivations of your target audience"
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button 
                    variant="contained" 
                    onClick={handleNext}
                    disabled={!campaignName || !targetAudience}
                    sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                  >
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Budget & Timeline */}
            <Step>
              <StepLabel>Budget & Timeline</StepLabel>
              <StepContent>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Total Budget"
                      value={budget > 0 ? formatBudget(budget.toString()) : ''}
                      onChange={(e) => {
                        const parsed = parseBudget(e.target.value);
                        setBudget(parsed);
                        // Auto-calculate daily budget when total budget changes
                        if (parsed > 0 && duration > 0) {
                          const newDailyBudget = Math.round(parsed / duration);
                          setDailyBudget(newDailyBudget);
                        }
                      }}
                      InputProps={{ 
                        startAdornment: '$',
                      }}
                      error={budget > 0 && !validateBudget(budget)}
                      helperText={
                        budget > 0 && !validateBudget(budget) 
                          ? 'Budget must be greater than $0' 
                          : 'Minimum recommended: $5,000 for meaningful results'
                      }
                      placeholder="15,000"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Daily Budget"
                      value={dailyBudget > 0 ? formatBudget(dailyBudget.toString()) : ''}
                      onChange={(e) => {
                        const parsed = parseBudget(e.target.value);
                        setDailyBudget(parsed);
                        // Auto-calculate total budget when daily budget changes
                        if (parsed > 0 && duration > 0) {
                          const newTotalBudget = parsed * duration;
                          setBudget(newTotalBudget);
                        }
                      }}
                      InputProps={{ 
                        startAdornment: '$',
                      }}
                      error={dailyBudget > 0 && (!validateBudget(dailyBudget) || dailyBudget * duration > budget)}
                      helperText={
                        dailyBudget > 0 && !validateBudget(dailyBudget)
                          ? 'Daily budget must be greater than $0'
                          : dailyBudget * duration > budget
                          ? `Daily budget × duration ($${(dailyBudget * duration).toLocaleString()}) exceeds total budget`
                          : `Total spend over ${duration} days: $${(dailyBudget * duration).toLocaleString()}`
                      }
                      placeholder="500"
                    />
                  </Grid>
                  
                  {/* Enhanced Campaign Duration Section */}
                  <Grid item xs={12}>
                    <Card sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          Campaign Duration
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          Choose the optimal duration for your campaign. Longer campaigns allow for better optimization and learning.
                        </Typography>
                      </Box>
                      
                      {/* Duration Display */}
                      <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#f97316', mb: 1 }}>
                          {duration}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#374151', fontWeight: 500 }}>
                          {duration === 1 ? 'Day' : 'Days'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                          {duration < 7 ? 'Very Short Campaign' :
                           duration < 14 ? 'Short Campaign' :
                           duration < 30 ? 'Standard Campaign' :
                           duration < 60 ? 'Extended Campaign' :
                           duration < 90 ? 'Long Campaign' : 'Very Long Campaign'}
                        </Typography>
                      </Box>

                      {/* Professional Slider */}
                      <Box sx={{ px: 2 }}>
                        <Slider
                          value={duration}
                          min={7}
                          max={120}
                          step={1}
                          onChange={(_, value) => {
                            const newDuration = value as number;
                            setDuration(newDuration);
                            // Auto-calculate daily budget when duration changes
                            if (budget > 0 && newDuration > 0) {
                              const newDailyBudget = Math.round(budget / newDuration);
                              setDailyBudget(newDailyBudget);
                            }
                          }}
                          valueLabelDisplay="auto"
                          sx={{
                            color: '#f97316',
                            height: 8,
                            '& .MuiSlider-track': {
                              border: 'none',
                              background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)',
                            },
                            '& .MuiSlider-thumb': {
                              height: 24,
                              width: 24,
                              backgroundColor: '#fff',
                              border: '3px solid #f97316',
                              boxShadow: '0 4px 8px rgba(249, 115, 22, 0.3)',
                              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                                boxShadow: '0 6px 12px rgba(249, 115, 22, 0.4)',
                                transform: 'scale(1.1)',
                              },
                            },
                            '& .MuiSlider-rail': {
                              color: '#e2e8f0',
                              opacity: 1,
                              height: 8,
                            },
                            '& .MuiSlider-mark': {
                              backgroundColor: '#94a3b8',
                              height: 12,
                              width: 3,
                              borderRadius: 2,
                              '&.MuiSlider-markActive': {
                                backgroundColor: '#f97316',
                              },
                            },
                            '& .MuiSlider-markLabel': {
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              color: '#6b7280',
                              '&.MuiSlider-markLabelActive': {
                                color: '#f97316',
                                fontWeight: 600,
                              },
                            },
                            '& .MuiSlider-valueLabel': {
                              backgroundColor: '#374151',
                              color: '#fff',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              padding: '6px 12px',
                              borderRadius: '8px',
                              '&:before': {
                                borderTopColor: '#374151',
                              },
                            },
                          }}
                          marks={[
                            { value: 7, label: '1 Week' },
                            { value: 14, label: '2 Weeks' },
                            { value: 30, label: '1 Month' },
                            { value: 60, label: '2 Months' },
                            { value: 90, label: '3 Months' },
                            { value: 120, label: '4 Months' }
                          ]}
                        />
                      </Box>

                      {/* Duration Insights */}
                      <Box sx={{ mt: 4, p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#374151' }}>
                          Duration Insights
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669', mb: 1 }}>
                                Learning Phase
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                {duration < 14 ? 'Limited learning' : 
                                 duration < 30 ? 'Basic optimization' : 
                                 'Full optimization potential'}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#3b82f6', mb: 1 }}>
                                Budget Efficiency
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                ${Math.round(budget / duration).toLocaleString()}/day
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Box sx={{ textAlign: 'center', p: 2 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#8b5cf6', mb: 1 }}>
                                Campaign Type
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                {duration < 30 ? 'Sprint' : duration < 60 ? 'Standard' : 'Marathon'}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Recommendations */}
                      <Box sx={{ mt: 3, p: 2, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fbbf24' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e', mb: 1 }}>
                          💡 Recommendation
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.875rem' }}>
                          {duration < 14 && 'Consider extending to at least 14 days for better optimization results.'}
                          {duration >= 14 && duration < 30 && 'Good duration for testing. Consider 30+ days for full optimization.'}
                          {duration >= 30 && duration <= 90 && 'Excellent duration for learning and optimization!'}
                          {duration > 90 && 'Long campaigns work well for brand awareness and sustained growth.'}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={`Target ${primaryKpi}`}
                      type="number"
                      value={kpiTarget}
                      onChange={(e) => setKpiTarget(parseInt(e.target.value) || 0)}
                      helperText={`Target ${primaryKpi} you want to achieve`}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button 
                    variant="contained" 
                    onClick={handleNext}
                    sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                  >
                    Next
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 4: Channels & Targeting */}
            <Step>
              <StepLabel>Channels & Targeting</StepLabel>
              <StepContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Select Marketing Channels</Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                  Choose 3-5 channels for optimal performance. Each channel serves different purposes and audiences.
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {[
                    { name: 'Search', desc: 'Google Ads - Target high-intent users searching for your products' },
                    { name: 'Meta', desc: 'Facebook & Instagram - Broad reach with detailed targeting options' },
                    { name: 'LinkedIn', desc: 'Professional network - Perfect for B2B lead generation' },
                    { name: 'YouTube', desc: 'Video advertising - Great for brand awareness and engagement' },
                    { name: 'Performance Max', desc: 'Google\'s AI-driven campaigns across all Google properties' },
                    { name: 'TikTok', desc: 'Short-form video - Ideal for younger demographics and viral content' },
                    { name: 'Display', desc: 'Banner ads across websites - Good for retargeting and awareness' },
                    { name: 'Email', desc: 'Direct communication - High ROI for existing customer base' },
                    { name: 'SMS', desc: 'Text messaging - Immediate reach with high open rates' }
                  ].map(channel => (
                    <Grid item xs={12} sm={6} md={4} key={channel.name}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: channels.includes(channel.name) ? '2px solid #f97316' : '1px solid #e5e7eb',
                          bgcolor: channels.includes(channel.name) ? '#fff7ed' : 'white',
                          '&:hover': { borderColor: '#f97316' },
                          height: '100%'
                        }}
                        onClick={() => toggleChannel(channel.name)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {channel.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={channels.includes(channel.name) ? "Selected" : "Select"}
                              color={channels.includes(channel.name) ? "primary" : "default"}
                              variant={channels.includes(channel.name) ? "filled" : "outlined"}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
                            {channel.desc}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Budget Allocation Preview */}
                {channels.length > 0 && (
                  <Card sx={{ mb: 3, bgcolor: '#f8fafc' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Recommended Budget Allocation</Typography>
                      <Grid container spacing={2}>
                        {budgetAllocation.map(({ channel, percentage, amount }) => (
                          <Grid item xs={12} sm={6} md={4} key={channel}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'white', borderRadius: 2 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f97316' }}>
                                {percentage}%
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                {channel}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ${amount.toLocaleString()}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Settings */}
                <Accordion expanded={showAdvanced} onChange={() => setShowAdvanced(!showAdvanced)}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Advanced Targeting Options</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Geographic Targeting</InputLabel>
                          <Select
                            multiple
                            value={geo}
                            label="Geographic Targeting"
                            onChange={(e) => setGeo(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => {
                                  const option = geoOptions.find(opt => opt.value === value);
                                  return (
                                    <Chip 
                                      key={value} 
                                      label={option?.label || value} 
                                      size="small" 
                                      sx={{ bgcolor: '#f0f9ff', color: '#3b82f6' }}
                                    />
                                  );
                                })}
                              </Box>
                            )}
                          >
                            {/* Group by country */}
                            {['Canada', 'United States', 'Europe', 'Oceania'].map(country => (
                              <Box key={country}>
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{ 
                                    px: 2, 
                                    py: 1, 
                                    bgcolor: '#f8fafc', 
                                    fontWeight: 600,
                                    color: '#374151'
                                  }}
                                >
                                  {country}
                                </Typography>
                                {geoOptions
                                  .filter(option => option.country === country)
                                  .map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                      {option.label}
                                    </MenuItem>
                                  ))}
                              </Box>
                            ))}
                          </Select>
                        </FormControl>
                        <Typography variant="body2" sx={{ color: '#6b7280', mt: 1, fontSize: '0.875rem' }}>
                          Select 1-5 geographic locations for focused targeting. More locations may dilute performance.
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button 
                    variant="contained" 
                    onClick={handleNext}
                    disabled={channels.length === 0}
                    sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                  >
                    Review Campaign
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 5: Review & Launch */}
            <Step>
              <StepLabel>Review & Launch</StepLabel>
              <StepContent>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={8}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>Campaign Summary</Typography>
                        <List>
                          <ListItem>
                            <ListItemText 
                              primary="Campaign Name" 
                              secondary={campaignName}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Objective" 
                              secondary={`${objective.replace('_', ' ')} - Target ${primaryKpi}: ${kpiTarget}`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Budget & Duration" 
                              secondary={`$${budget.toLocaleString()} over ${duration} days ($${dailyBudget}/day)`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Channels" 
                              secondary={channels.join(', ')}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Target Audience" 
                              secondary={targetAudience}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#f0f9ff', mb: 3 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <SpeedIcon sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                          {designScore.score}/100
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                          Campaign Design Score
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<CopyIcon />}
                          onClick={generateCampaignPlan}
                          sx={{ mb: 2, bgcolor: '#3b82f6' }}
                        >
                          Export Plan
                        </Button>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => setActiveStep(1)}
                        >
                          Edit Campaign
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Scoring Explanation */}
                    <Card sx={{ bgcolor: '#f8fafc' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          How We Score Your Campaign
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                          Our AI evaluates your campaign across multiple dimensions:
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            • Objective-Channel Alignment (25 pts)
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', ml: 2 }}>
                            How well your channels match your campaign objective
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            • Budget Adequacy (20 pts)
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', ml: 2 }}>
                            Sufficient budget for meaningful results and proper allocation
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            • Channel Diversity (15 pts)
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', ml: 2 }}>
                            Balanced mix of 3-5 channels for risk mitigation
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            • Audience Targeting (15 pts)
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', ml: 2 }}>
                            Completeness and specificity of target audience
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            • Geographic Focus (10 pts)
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', ml: 2 }}>
                            Focused geographic targeting (1-5 locations)
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            • Campaign Duration (10 pts)
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', ml: 2 }}>
                            Optimal 30-90 day duration for learning and optimization
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            • KPI Target (5 pts)
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem', ml: 2 }}>
                            Realistic and measurable KPI target set
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Improvement Suggestions */}
                    {designScore.feedback.length > 0 && (
                      <Card sx={{ bgcolor: '#fffbeb', mt: 3 }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#d97706' }}>
                            Optimization Suggestions
                          </Typography>
                          <List dense>
                            {designScore.feedback.map((feedback) => (
                              <ListItem key={feedback} sx={{ py: 0.5, px: 0 }}>
                                <Typography variant="body2" sx={{ 
                                  color: feedback.startsWith('✓') ? '#059669' : '#d97706',
                                  fontSize: '0.875rem'
                                }}>
                                  {feedback}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                          {designScore.score < 80 && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#fef3c7', borderRadius: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#92400e', mb: 1 }}>
                                💡 Quick Wins to Improve Your Score:
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#92400e', fontSize: '0.8rem' }}>
                                {designScore.score < 60 && '• Increase your budget to at least $5,000 for better results'}
                                {designScore.score < 70 && audienceInterests.length === 0 && '• Add audience interests for better targeting'}
                                {designScore.score < 75 && channels.length < 3 && '• Consider adding 1-2 more marketing channels'}
                                {designScore.score < 80 && duration < 30 && '• Extend campaign duration to 30+ days for optimization'}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button onClick={handleBack} disabled={isCreating}>Back</Button>
                  <Button 
                    variant="contained" 
                    startIcon={isCreating ? undefined : <RocketIcon />}
                    onClick={createCampaign}
                    disabled={isCreating || !campaignName || !targetAudience || channels.length === 0}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    {isCreating ? 'Creating Campaign...' : 'Launch Campaign'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>

      {/* Template Selection Dialog */}
      <Dialog 
        open={showTemplateDialog} 
        onClose={() => setShowTemplateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Choose a Campaign Template</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {campaignTemplates.map(template => (
              <Grid item xs={12} sm={6} key={template.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    '&:hover': { borderColor: template.color },
                    height: '100%'
                  }}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h4" sx={{ mr: 2 }}>{template.icon}</Typography>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {template.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          ${template.budget.toLocaleString()} • {template.duration} days
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                      {template.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {template.channels.map(channel => (
                        <Chip 
                          key={channel} 
                          label={channel} 
                          size="small" 
                          sx={{ bgcolor: `${template.color}20`, color: template.color }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
