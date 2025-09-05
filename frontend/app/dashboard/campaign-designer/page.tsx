'use client'

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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

  // Real-time calculations
  const designScore = useMemo(() => {
    let score = 50;
    
    // Objective-channel alignment
    if (objective === 'lead_gen' && channels.includes('Search')) score += 15;
    if (objective === 'ecommerce_sales' && channels.includes('Performance Max')) score += 15;
    if (objective === 'awareness' && channels.includes('YouTube')) score += 15;
    
    // Budget adequacy
    if (budget >= 10000) score += 10;
    if (dailyBudget * duration <= budget) score += 10;
    
    // Channel diversity
    if (channels.length >= 3) score += 10;
    if (channels.length <= 5) score += 5;
    
    return Math.min(100, Math.max(0, score));
  }, [objective, channels, budget, dailyBudget, duration]);

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
    const plan = {
      name: campaignName,
      objective,
      primaryKpi,
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
      designScore,
      createdAt: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    // Could also save to backend here
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

      {/* Design Score Card */}
      {activeStep > 0 && (() => {
        const getScoreColor = () => {
          if (designScore >= 80) return '#3b82f6';
          if (designScore >= 60) return '#f59e0b';
          return '#ef4444';
        };
        
        const getScoreBgColor = () => {
          if (designScore >= 80) return '#f0f9ff';
          if (designScore >= 60) return '#fffbeb';
          return '#fef2f2';
        };
        
        const getScoreMessage = () => {
          if (designScore >= 80) return 'Excellent campaign setup!';
          if (designScore >= 60) return 'Good setup, consider optimizations';
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
                      Design Score: {designScore}/100
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
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Target Audience Description"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g., B2B decision makers, 25-54, interested in project management software"
                      multiline
                      rows={2}
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
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                      InputProps={{ startAdornment: '$' }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Daily Budget"
                      type="number"
                      value={dailyBudget}
                      onChange={(e) => setDailyBudget(parseInt(e.target.value) || 0)}
                      InputProps={{ startAdornment: '$' }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography gutterBottom>Campaign Duration: {duration} days</Typography>
                    <Slider
                      value={duration}
                      min={7}
                      max={120}
                      step={1}
                      onChange={(_, value) => setDuration(value as number)}
                      valueLabelDisplay="auto"
                      marks={[
                        { value: 7, label: '1 week' },
                        { value: 30, label: '1 month' },
                        { value: 60, label: '2 months' },
                        { value: 90, label: '3 months' }
                      ]}
                    />
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
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {['Search', 'Meta', 'LinkedIn', 'YouTube', 'Performance Max', 'TikTok', 'Display', 'Email', 'SMS'].map(channel => (
                    <Grid item key={channel}>
                      <Chip
                        label={channel}
                        onClick={() => toggleChannel(channel)}
                        color={channels.includes(channel) ? "primary" : "default"}
                        variant={channels.includes(channel) ? "filled" : "outlined"}
                        sx={{ cursor: 'pointer' }}
                      />
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
                        <TextField
                          fullWidth
                          label="Geographic Targeting"
                          value={geo.join(', ')}
                          onChange={(e) => setGeo(e.target.value.split(', '))}
                          placeholder="CA-ON, CA-BC, US-CA"
                        />
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
                    <Card sx={{ bgcolor: '#f0f9ff' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <SpeedIcon sx={{ fontSize: 48, color: '#3b82f6', mb: 2 }} />
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                          {designScore}/100
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
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button 
                    variant="contained" 
                    startIcon={<RocketIcon />}
                    onClick={() => router.push('/dashboard/campaigns')}
                    sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }}
                  >
                    Launch Campaign
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
