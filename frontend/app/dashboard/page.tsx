'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  Button,
  Avatar,
  Paper,
  Alert,
  Grid,
  Chip,
  IconButton,
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  People as PeopleIcon,
  TrackChanges as TargetIcon,
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  DataUsage as DataUsageIcon,
  Campaign as CampaignIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface UserData {
  name?: string
  email?: string
  [key: string]: any
}

export default function DashboardPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // Fetch user data and dashboard metrics from API
    fetchDashboardData()
  }, [selectedDateRange])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Get user data from localStorage for now
      const userDataStr = localStorage.getItem('user')
      if (userDataStr) {
        setUserData(JSON.parse(userDataStr))
      }
      
      // TODO: Fetch real analytics data from backend API
      // const response = await fetch(`${API_URL}/api/v1/analytics/dashboard?range=${selectedDateRange}`)
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Welcome to Nexopeak!
        </Typography>
        <Typography variant="h6" sx={{ color: '#f97316', fontWeight: 600, mb: 2 }}>
          Discover Your Next Marketing Peak
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          {userData ? `Hello, ${userData.name}! ` : ''}Your analytics dashboard is ready to track your website performance.
        </Typography>
      </Box>

      {/* Welcome Card for New Users */}
      <Card sx={{ mb: 4, bgcolor: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mr: 2, width: 56, height: 56 }}>
              <AnalyticsIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
                Get Started with Analytics
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Connect your website to start tracking performance metrics
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: 'white', 
                color: '#f97316', 
                '&:hover': { bgcolor: '#f9fafb' } 
              }}
              startIcon={<DataUsageIcon />}
            >
              Connect Google Analytics
            </Button>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: 'white', 
                color: 'white',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              View Documentation
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Empty State KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Total Sessions
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#9ca3af' }}>
                  --
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#fef3c7', color: '#f97316' }}>
                <BarChartIcon />
              </Avatar>
            </Box>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Connect analytics to view data
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Engaged Sessions
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#9ca3af' }}>
                  --
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#f0fdf4', color: '#22c55e' }}>
                <PeopleIcon />
              </Avatar>
            </Box>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Connect analytics to view data
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Conversions
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#9ca3af' }}>
                  --
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#fffbeb', color: '#f59e0b' }}>
                <TargetIcon />
              </Avatar>
            </Box>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Connect analytics to view data
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Avg. Engagement
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#9ca3af' }}>
                  --
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#fef2f2', color: '#dc2626' }}>
                <ScheduleIcon />
              </Avatar>
            </Box>
            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
              Connect analytics to view data
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Campaigns Overview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#f97316', color: 'white' }}>
                <CampaignIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                  Campaigns Overview
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Manage and monitor your marketing campaigns
                </Typography>
              </Box>
            </Box>
            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => window.location.href = '/dashboard/campaigns'}
              sx={{ borderColor: '#f97316', color: '#f97316', '&:hover': { borderColor: '#ea580c', bgcolor: '#fff7ed' } }}
            >
              View All
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Campaign Stats */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#16a34a', fontWeight: 'bold' }}>
                  3
                </Typography>
                <Typography variant="body2" sx={{ color: '#15803d' }}>
                  Active Campaigns
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#fef3c7', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#d97706', fontWeight: 'bold' }}>
                  1
                </Typography>
                <Typography variant="body2" sx={{ color: '#b45309' }}>
                  Paused Campaigns
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#dbeafe', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#2563eb', fontWeight: 'bold' }}>
                  $12.5K
                </Typography>
                <Typography variant="body2" sx={{ color: '#1d4ed8' }}>
                  Total Budget
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f3e8ff', borderRadius: 2 }}>
                <Typography variant="h4" sx={{ color: '#7c3aed', fontWeight: 'bold' }}>
                  2.8x
                </Typography>
                <Typography variant="body2" sx={{ color: '#6d28d9' }}>
                  Avg. ROAS
                </Typography>
              </Box>
            </Grid>

            {/* Recent Campaigns */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Campaigns
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { name: 'Holiday Shopping Campaign', status: 'active', platform: 'Google Ads', performance: '+12%' },
                  { name: 'Brand Awareness Q1', status: 'paused', platform: 'Facebook Ads', performance: '-3%' },
                  { name: 'Product Launch Campaign', status: 'draft', platform: 'Instagram', performance: 'N/A' }
                ].map((campaign, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: '#f9fafb',
                      borderRadius: 2,
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: campaign.status === 'active' ? '#16a34a' : campaign.status === 'paused' ? '#d97706' : '#6b7280', width: 32, height: 32 }}>
                        <CampaignIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {campaign.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                          {campaign.platform}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Chip
                        label={campaign.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: campaign.status === 'active' ? '#dcfce7' : campaign.status === 'paused' ? '#fef3c7' : '#f3f4f6',
                          color: campaign.status === 'active' ? '#15803d' : campaign.status === 'paused' ? '#b45309' : '#6b7280',
                          fontWeight: 'bold'
                        }}
                      />
                      <Typography variant="body2" sx={{ 
                        color: campaign.performance.includes('+') ? '#16a34a' : campaign.performance.includes('-') ? '#dc2626' : '#6b7280',
                        fontWeight: 'bold',
                        minWidth: 40
                      }}>
                        {campaign.performance}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => window.location.href = '/dashboard/campaigns'}
                      >
                        <ArrowForwardIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Empty State Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Performance Trends
            </Typography>
            <Box 
              sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: '#f9fafb',
                borderRadius: 2,
                border: '2px dashed #d1d5db'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <TrendingUpIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  Charts will appear here once you connect your analytics
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Traffic Sources
            </Typography>
            <Box 
              sx={{ 
                height: 300, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: '#f9fafb',
                borderRadius: 2,
                border: '2px dashed #d1d5db'
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <DataUsageIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  Traffic source breakdown will show here
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Getting Started Card */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 3 }}>
            Quick Setup Guide
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Your account has been created successfully! Follow these steps to get the most out of Nexopeak.
            </Alert>
            
            <Paper sx={{ p: 3, border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#f97316', width: 32, height: 32, fontSize: 16 }}>1</Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Connect Your Analytics
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                Link your Google Analytics or other tracking tools to start seeing real data.
              </Typography>
              <Button variant="outlined" size="small" sx={{ color: '#f97316', borderColor: '#f97316' }}>
                Connect Now
              </Button>
            </Paper>

            <Paper sx={{ p: 3, border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6b7280', width: 32, height: 32, fontSize: 16 }}>2</Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Set Up Goals & Conversions
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Define what success means for your website to track meaningful metrics.
              </Typography>
            </Paper>

            <Paper sx={{ p: 3, border: '1px solid #e5e7eb' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: '#6b7280', width: 32, height: 32, fontSize: 16 }}>3</Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Explore Features
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Discover campaign generator, analytics insights, and automated reports.
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
