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
  Chip,
  Avatar,
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Mouse as MouseIcon,
  TrackChanges as TargetIcon,
  CalendarToday as CalendarIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

// Mock data - replace with API calls
const mockKPIData = {
  sessions: { value: 12450, change: 12.5, trend: 'up' },
  engagedSessions: { value: 8920, change: 8.3, trend: 'up' },
  conversions: { value: 342, change: -2.1, trend: 'down' },
  engagementTime: { value: '2m 34s', change: 15.7, trend: 'up' }
}

const mockChartData = [
  { date: 'Mon', sessions: 1200, conversions: 35 },
  { date: 'Tue', sessions: 1350, conversions: 42 },
  { date: 'Wed', sessions: 1100, conversions: 28 },
  { date: 'Thu', sessions: 1400, conversions: 45 },
  { date: 'Fri', sessions: 1250, conversions: 38 },
  { date: 'Sat', sessions: 950, conversions: 25 },
  { date: 'Sun', sessions: 800, conversions: 20 }
]

const mockInsights = [
  {
    id: 1,
    type: 'success',
    title: 'Mobile sessions increased 25%',
    description: 'Mobile traffic saw significant growth this week, likely due to recent mobile optimization.',
    action: 'Review mobile landing page performance',
    priority: 'high'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Organic search CTR dropped 8%',
    description: 'Click-through rate from organic search decreased, potentially affecting conversions.',
    action: 'Review meta descriptions and titles',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'info',
    title: 'New keyword opportunity detected',
    description: 'High-volume keyword "digital marketing tools" shows potential for content creation.',
    action: 'Create content targeting this keyword',
    priority: 'low'
  }
]

export default function DashboardPage() {
  const [selectedDateRange, setSelectedDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // TODO: Fetch dashboard data based on selected date range
    console.log('Fetching data for date range:', selectedDateRange)
  }, [selectedDateRange])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUpIcon sx={{ color: '#22c55e' }} />
      case 'warning':
        return <TargetIcon sx={{ color: '#f59e0b' }} />
      case 'critical':
        return <TrendingDownIcon sx={{ color: '#dc2626' }} />
      default:
        return <TrendingUpIcon sx={{ color: '#f97316' }} />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'default'
      default:
        return 'default'
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#f0fdf4'
      case 'warning':
        return '#fffbeb'
      case 'critical':
        return '#fef2f2'
      default:
        return '#fef3c7'
    }
  }

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#22c55e'
      case 'warning':
        return '#f59e0b'
      case 'critical':
        return '#dc2626'
      default:
        return '#f97316'
    }
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Performance overview and insights
        </Typography>
        
        {/* Date Range Selector */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2, 
          alignItems: { xs: 'stretch', sm: 'center' } 
        }}>
          <Select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 200 } }}
          >
            <MenuItem value="1d">Last 24 hours</MenuItem>
            <MenuItem value="7d">Last 7 days</MenuItem>
            <MenuItem value="30d">Last 30 days</MenuItem>
            <MenuItem value="90d">Last 90 days</MenuItem>
          </Select>
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            sx={{ minWidth: { xs: '100%', sm: 'auto' }, bgcolor: '#f97316' }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Total Sessions
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                  {mockKPIData.sessions.value.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#fef3c7', color: '#f97316' }}>
                <BarChartIcon />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {mockKPIData.sessions.trend === 'up' ? (
                <TrendingUpIcon sx={{ mr: 1, fontSize: 20, color: '#22c55e' }} />
              ) : (
                <TrendingDownIcon sx={{ mr: 1, fontSize: 20, color: '#dc2626' }} />
              )}
              <Typography
                variant="body2"
                sx={{ 
                  fontWeight: 600,
                  color: mockKPIData.sessions.trend === 'up' ? '#22c55e' : '#dc2626'
                }}
              >
                {mockKPIData.sessions.change}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', ml: 1 }}>
                vs last period
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Engaged Sessions
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                  {mockKPIData.engagedSessions.value.toLocaleString()}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#f0fdf4', color: '#22c55e' }}>
                <PeopleIcon />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {mockKPIData.engagedSessions.trend === 'up' ? (
                <TrendingUpIcon sx={{ mr: 1, fontSize: 20, color: '#22c55e' }} />
              ) : (
                <TrendingDownIcon sx={{ mr: 1, fontSize: 20, color: '#dc2626' }} />
              )}
              <Typography
                variant="body2"
                sx={{ 
                  fontWeight: 600,
                  color: mockKPIData.engagedSessions.trend === 'up' ? '#22c55e' : '#dc2626'
                }}
              >
                {mockKPIData.engagedSessions.change}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', ml: 1 }}>
                vs last period
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Conversions
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                  {mockKPIData.conversions.value}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#fffbeb', color: '#f59e0b' }}>
                <TargetIcon />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {mockKPIData.conversions.trend === 'up' ? (
                <TrendingUpIcon sx={{ mr: 1, fontSize: 20, color: '#22c55e' }} />
              ) : (
                <TrendingDownIcon sx={{ mr: 1, fontSize: 20, color: '#dc2626' }} />
              )}
              <Typography
                variant="body2"
                sx={{ 
                  fontWeight: 600,
                  color: mockKPIData.conversions.trend === 'up' ? '#22c55e' : '#dc2626'
                }}
              >
                {mockKPIData.conversions.change}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', ml: 1 }}>
                vs last period
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                  Avg. Engagement
                </Typography>
                <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                  {mockKPIData.engagementTime.value}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#fef2f2', color: '#dc2626' }}>
                <ScheduleIcon />
              </Avatar>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {mockKPIData.engagementTime.trend === 'up' ? (
                <TrendingUpIcon sx={{ mr: 1, fontSize: 20, color: '#22c55e' }} />
              ) : (
                <TrendingDownIcon sx={{ mr: 1, fontSize: 20, color: '#dc2626' }} />
              )}
              <Typography
                variant="body2"
                sx={{ 
                  fontWeight: 600,
                  color: mockKPIData.engagementTime.trend === 'up' ? '#22c55e' : '#dc2626'
                }}
              >
                {mockKPIData.engagementTime.change}%
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', ml: 1 }}>
                vs last period
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Sessions & Conversions Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#f97316" strokeWidth={2} />
                <Line type="monotone" dataKey="conversions" stroke="#22c55e" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Traffic Sources
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { source: 'Organic', sessions: 4500 },
                { source: 'Direct', sessions: 3200 },
                { source: 'Social', sessions: 2800 },
                { source: 'Referral', sessions: 1950 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Insights Section */}
      <Card>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            justifyContent: 'space-between', 
            mb: 3,
            gap: 2
          }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              Today's Insights
            </Typography>
            <Button
              variant="text"
              sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' }, color: '#f97316' }}
            >
              View All Insights
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {mockInsights.map((insight) => (
              <Box
                key={insight.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderLeft: 4,
                  borderColor: getInsightBorderColor(insight.type),
                  bgcolor: getInsightColor(insight.type),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {getInsightIcon(insight.type)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 600, mb: 1 }}>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                      {insight.description}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      alignItems: { xs: 'stretch', sm: 'center' }, 
                      justifyContent: 'space-between',
                      gap: 2
                    }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        Suggested action: {insight.action}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${insight.priority} priority`}
                          color={getPriorityColor(insight.priority)}
                          size="small"
                        />
                        <Button
                          variant="text"
                          size="small"
                          sx={{ color: '#f97316' }}
                        >
                          Take Action
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
