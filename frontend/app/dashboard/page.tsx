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
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    // Fetch user data and dashboard metrics from API
    fetchDashboardData()
  }, [selectedDateRange])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Get user data from localStorage for now
      const userDataStr = localStorage.getItem('user_data')
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
