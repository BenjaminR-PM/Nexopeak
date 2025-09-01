'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Grid,
} from '@mui/material'
import {
  Logout,
  People,
  Settings,
  AccountCircle,
  Business,
  Analytics,
  Payment,
  Link as LinkIcon,
  Insights,
  MonetizationOn,
  TrendingUp,
} from '@mui/icons-material'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      router.push('/admin-login')
      return
    }

    try {
      const user = JSON.parse(userData)
      if (user.role !== 'admin') {
        router.push('/admin-login')
        return
      }
      setUser(user)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/admin-login')
    }
  }, [router])

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    router.push('/admin-login')
  }

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading admin dashboard...</Typography>
      </Box>
    )
  }

  const nexopeakAdminModules = [
    {
      title: 'GA4 Connections',
      description: 'Monitor all Google Analytics integrations across clients',
      icon: LinkIcon,
      href: '/admin-dashboard/ga4-connections',
      color: '#dc2626',
      stats: '127 Active',
      priority: 'high'
    },
    {
      title: 'Client Management',
      description: 'Manage organizations, subscriptions, and client accounts',
      icon: Business,
      href: '/admin-dashboard/clients',
      color: '#dc2626',
      stats: '89 Clients',
      priority: 'high'
    },
    {
      title: 'Data Insights Admin',
      description: 'Platform-wide analytics and data quality monitoring',
      icon: Insights,
      href: '/admin-dashboard/data-insights',
      color: '#dc2626',
      stats: '2.4M Events',
      priority: 'high'
    },
    {
      title: 'Billing & Revenue',
      description: 'Subscription management, billing, and revenue analytics',
      icon: MonetizationOn,
      href: '/admin-dashboard/billing',
      color: '#dc2626',
      stats: '$12.4K MRR',
      priority: 'high'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and access permissions',
      icon: People,
      href: '/admin-dashboard/users',
      color: '#1e40af',
      stats: '234 Users',
      priority: 'medium'
    },
    {
      title: 'Platform Settings',
      description: 'System configuration, API limits, and feature flags',
      icon: Settings,
      href: '/admin-dashboard/settings',
      color: '#1e40af',
      stats: 'Configure',
      priority: 'medium'
    }
  ]

  const highPriorityModules = nexopeakAdminModules.filter(m => m.priority === 'high')
  const mediumPriorityModules = nexopeakAdminModules.filter(m => m.priority === 'medium')

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%)'
    }}>
      {/* Admin Header */}
      <AppBar position="static" sx={{ backgroundColor: 'rgba(30, 58, 138, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Analytics sx={{ mr: 2, color: '#ef4444' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Nexopeak Analytics Admin
          </Typography>
          
          <Chip 
            label="PLATFORM ADMIN" 
            size="small" 
            sx={{ 
              backgroundColor: '#ef4444', 
              color: 'white', 
              fontWeight: 600,
              mr: 2
            }} 
          />

          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuClick}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: '#ef4444', width: 32, height: 32 }}>
              {user.name?.charAt(0) || user.email?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Admin Content */}
      <Box sx={{ p: 4 }}>
        {/* Welcome Section */}
        <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Analytics sx={{ fontSize: 40, color: '#dc2626', mr: 2 }} />
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700} color="#1e3a8a">
                  Nexopeak Platform Admin
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Analytics Platform Management Dashboard
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary">
              Monitor and manage the Nexopeak analytics platform. Oversee GA4 integrations, client accounts, 
              data quality, billing, and platform performance.
            </Typography>
          </CardContent>
        </Card>

        {/* Core Analytics Modules */}
        <Typography variant="h5" component="h2" fontWeight={600} color="white" mb={3}>
          🎯 Core Analytics Management
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {highPriorityModules.map((module: any) => {
            const IconComponent = module.icon
            return (
              <Grid item xs={12} md={6} lg={3} key={module.href}>
                <Link href={module.href} style={{ textDecoration: 'none' }}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(220, 38, 38, 0.2)',
                        border: '2px solid #dc2626',
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <IconComponent 
                        sx={{ 
                          fontSize: 48, 
                          color: module.color, 
                          mb: 2 
                        }} 
                      />
                      <Typography variant="h6" component="h3" fontWeight={600} mb={1}>
                        {module.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {module.description}
                      </Typography>
                      <Chip 
                        label={module.stats} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#fef2f2',
                          color: '#dc2626',
                          fontWeight: 600,
                          border: '1px solid #fecaca'
                        }} 
                      />
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            )
          })}
        </Grid>

        {/* System Management */}
        <Typography variant="h5" component="h2" fontWeight={600} color="white" mb={3}>
          ⚙️ System Management
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {mediumPriorityModules.map((module: any) => {
            const IconComponent = module.icon
            return (
              <Grid item xs={12} md={6} key={module.href}>
                <Link href={module.href} style={{ textDecoration: 'none' }}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(30, 64, 175, 0.15)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <IconComponent 
                          sx={{ 
                            fontSize: 40, 
                            color: module.color, 
                            mr: 2 
                          }} 
                        />
                        <Box>
                          <Typography variant="h6" component="h3" fontWeight={600}>
                            {module.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {module.description}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip 
                          label={module.stats} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            fontWeight: 500
                          }} 
                        />
                        <Typography variant="body2" color="primary" fontWeight={500}>
                          Manage →
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            )
          })}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" component="h2" fontWeight={600} color="white" mb={3}>
            🚀 Quick Actions
          </Typography>
          
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button 
                  variant="contained" 
                  startIcon={<TrendingUp />}
                  sx={{ 
                    backgroundColor: '#dc2626', 
                    '&:hover': { backgroundColor: '#b91c1c' }
                  }}
                >
                  Platform Analytics
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<People />}
                  sx={{ 
                    borderColor: '#dc2626', 
                    color: '#dc2626',
                    '&:hover': { borderColor: '#b91c1c', backgroundColor: 'rgba(220, 38, 38, 0.04)' }
                  }}
                >
                  Add New Client
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<LinkIcon />}
                  sx={{ 
                    borderColor: '#dc2626', 
                    color: '#dc2626',
                    '&:hover': { borderColor: '#b91c1c', backgroundColor: 'rgba(220, 38, 38, 0.04)' }
                  }}
                >
                  Check GA4 Health
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Payment />}
                  sx={{ 
                    borderColor: '#dc2626', 
                    color: '#dc2626',
                    '&:hover': { borderColor: '#b91c1c', backgroundColor: 'rgba(220, 38, 38, 0.04)' }
                  }}
                >
                  Billing Overview
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}