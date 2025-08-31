'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import {
  AutoAwesome as SparklesIcon,
  Lightbulb as LightbulbIcon,
  Message as MessageIcon,
  TrendingUp as TrendingUpIcon,
  TrackChanges as TargetIcon,
  People as UsersIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as DollarIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface Campaign {
  id: string
  name: string
  type: 'social' | 'email' | 'search' | 'display'
  status: 'draft' | 'active' | 'paused' | 'completed'
  budget: number
  targetAudience: string
  startDate: string
  endDate: string
  performance: {
    impressions: number
    clicks: number
    conversions: number
    spend: number
  }
}

const mockCampaigns: Campaign[] = []

export default function CampaignGeneratorPage() {
  const [selectedTab, setSelectedTab] = useState(0)
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { id: 1, type: 'ai', message: 'Hello! I\'m your AI campaign assistant. I can help you create data-driven marketing campaigns based on your analytics and goals. What would you like to work on today?' }
  ])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue)
  }

  const handleGenerateCampaign = () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setAlertMessage('Campaign generated successfully!')
          setAlertSeverity('success')
          setShowAlert(true)
          setTimeout(() => setShowAlert(false), 3000)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleSendChat = () => {
    if (!chatMessage.trim()) return
    
    const newMessage = { id: Date.now(), type: 'user' as const, message: chatMessage }
    setChatHistory(prev => [...prev, newMessage])
    setChatMessage('')
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        type: 'ai' as const, 
        message: 'Thank you for your message! I\'m analyzing your request and will provide you with personalized campaign recommendations based on your data.' 
      }
      setChatHistory(prev => [...prev, aiResponse])
    }, 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'draft':
        return 'default'
      case 'paused':
        return 'warning'
      case 'completed':
        return 'info'
      default:
        return 'default'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'social':
        return 'primary'
      case 'email':
        return 'success'
      case 'search':
        return 'warning'
      case 'display':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          AI Campaign Generator
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Create data-driven marketing campaigns with AI assistance
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2, 
          alignItems: { xs: 'stretch', sm: 'center' } 
        }}>
          <Button
            variant="contained"
            startIcon={<SparklesIcon />}
            onClick={() => setShowCreateDialog(true)}
            sx={{ 
              bgcolor: '#f97316', 
              '&:hover': { bgcolor: '#ea580c' },
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Generate New Campaign
          </Button>
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            sx={{ 
              borderColor: '#f97316', 
              color: '#f97316',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            View Analytics
          </Button>
        </Box>
      </Box>

      {/* Alert */}
      {showAlert && (
        <Box sx={{ mb: 3 }}>
          <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        </Box>
      )}

      {/* Campaign Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#10b981' }}>
                {campaigns.filter(c => c.status === 'active').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Active Campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {campaigns.filter(c => c.status === 'draft').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Draft Campaigns
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                ${campaigns.reduce((sum, c) => sum + c.performance.spend, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Total Spend
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#8b5cf6' }}>
                {campaigns.reduce((sum, c) => sum + c.performance.conversions, 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Total Conversions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LightbulbIcon />
                    AI Insights
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MessageIcon />
                    AI Chat
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon />
                    Campaigns
                  </Box>
                } 
              />
            </Tabs>
          </Box>

          {/* AI Insights Tab */}
          {selectedTab === 0 && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                AI-Generated Campaign Insights
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TargetIcon sx={{ color: '#f97316' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Audience Insights
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                        Based on your analytics data, here are the key audience segments:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <UsersIcon sx={{ color: '#10b981' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="High-Value Customers (25-35 age group)"
                            secondary="Shows highest conversion rate and average order value"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUpIcon sx={{ color: '#3b82f6' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Mobile-First Users"
                            secondary="65% of your traffic comes from mobile devices"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarIcon sx={{ color: '#f59e0b' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Weekend Shoppers"
                            secondary="Peak activity on Saturdays and Sundays"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrendingUpIcon sx={{ color: '#f97316' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Performance Recommendations
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                        AI analysis suggests these optimizations:
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon sx={{ color: '#10b981' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Optimize for mobile experience"
                            secondary="Improve page load speed and mobile navigation"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon sx={{ color: '#10b981' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Target weekend shoppers"
                            secondary="Schedule campaigns for Friday-Sunday"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CheckCircleIcon sx={{ color: '#10b981' }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Focus on high-value segments"
                            secondary="Allocate 70% of budget to proven converters"
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <SparklesIcon sx={{ color: '#f97316' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Campaign Generation
                        </Typography>
                      </Box>
                      
                      {isGenerating ? (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Generating campaign strategy...
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={generationProgress} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {generationProgress}% complete
                          </Typography>
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<SparklesIcon />}
                          onClick={handleGenerateCampaign}
                          sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                        >
                          Generate Campaign Strategy
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* AI Chat Tab */}
          {selectedTab === 1 && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Chat with AI Campaign Assistant
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                        {chatHistory.map((message) => (
                          <Box
                            key={message.id}
                            sx={{
                              display: 'flex',
                              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                              mb: 2,
                            }}
                          >
                            <Box
                              sx={{
                                maxWidth: '70%',
                                p: 2,
                                borderRadius: 2,
                                bgcolor: message.type === 'user' ? '#f97316' : '#f3f4f6',
                                color: message.type === 'user' ? 'white' : 'inherit',
                              }}
                            >
                              <Typography variant="body2">
                                {message.message}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          placeholder="Ask me about campaign strategies..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                          size="small"
                        />
                        <Button
                          variant="contained"
                          onClick={handleSendChat}
                          disabled={!chatMessage.trim()}
                          sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                        >
                          <SendIcon />
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Quick Actions
                      </Typography>
                      <List dense>
                        <ListItem button>
                          <ListItemIcon>
                            <TargetIcon sx={{ color: '#f97316' }} />
                          </ListItemIcon>
                          <ListItemText primary="Analyze audience" />
                        </ListItem>
                        <ListItem button>
                          <ListItemIcon>
                            <TrendingUpIcon sx={{ color: '#f97316' }} />
                          </ListItemIcon>
                          <ListItemText primary="Review performance" />
                        </ListItem>
                        <ListItem button>
                          <ListItemIcon>
                            <CalendarIcon sx={{ color: '#f97316' }} />
                          </ListItemIcon>
                          <ListItemText primary="Schedule campaigns" />
                        </ListItem>
                        <ListItem button>
                          <ListItemIcon>
                            <DollarIcon sx={{ color: '#f97316' }} />
                          </ListItemIcon>
                          <ListItemText primary="Budget optimization" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Campaigns Tab */}
          {selectedTab === 2 && (
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                Your Campaigns
              </Typography>
              
              <Grid container spacing={3}>
                {campaigns.map((campaign) => (
                  <Grid item xs={12} md={6} key={campaign.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {campaign.name}
                          </Typography>
                          <Chip
                            label={campaign.status}
                            color={getStatusColor(campaign.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Chip
                            label={campaign.type}
                            color={getTypeColor(campaign.type)}
                            size="small"
                            sx={{ textTransform: 'capitalize', mr: 1 }}
                          />
                          <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                            Budget: ${campaign.budget.toLocaleString()}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                          {campaign.targetAudience}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Start Date
                            </Typography>
                            <Typography variant="body2">
                              {new Date(campaign.startDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              End Date
                            </Typography>
                            <Typography variant="body2">
                              {new Date(campaign.endDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {campaign.status === 'active' && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              Performance
                            </Typography>
                            <Grid container spacing={1} sx={{ mt: 1 }}>
                              <Grid item xs={6}>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                  Impressions: {campaign.performance.impressions.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                  Clicks: {campaign.performance.clicks.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                  Conversions: {campaign.performance.conversions.toLocaleString()}
                                </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                  Spend: ${campaign.performance.spend.toLocaleString()}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined">
                            Edit
                          </Button>
                          <Button size="small" variant="outlined">
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SparklesIcon sx={{ color: '#f97316' }} />
            Generate New Campaign
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Campaign Name"
                  placeholder="Enter campaign name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Campaign Type</InputLabel>
                  <Select label="Campaign Type">
                    <MenuItem value="social">Social Media</MenuItem>
                    <MenuItem value="email">Email Marketing</MenuItem>
                    <MenuItem value="search">Search Ads</MenuItem>
                    <MenuItem value="display">Display Advertising</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Budget"
                  type="number"
                  placeholder="Enter budget amount"
                  InputProps={{
                    startAdornment: <DollarIcon sx={{ mr: 1, color: '#f97316' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Audience"
                  placeholder="e.g., Young professionals, 25-35"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Campaign Goals"
                  placeholder="Describe your campaign objectives"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Use AI insights for optimization"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => {
              setShowCreateDialog(false)
              setAlertMessage('Campaign created successfully!')
              setAlertSeverity('success')
              setShowAlert(true)
              setTimeout(() => setShowAlert(false), 3000)
            }}
            sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
          >
            Create Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
