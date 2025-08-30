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
} from '@mui/material'
import {
  AdminPanelSettings,
  Logout,
  Dashboard as DashboardIcon,
  People,
  Settings,
  AccountCircle,
  Business,
  Security,
} from '@mui/icons-material'
import Link from 'next/link'

export default function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    
    if (!token || !userData) {
      router.push('/admin-login')
      return
    }

    const user = JSON.parse(userData)
    if (user.role !== 'admin') {
      router.push('/admin-login')
      return
    }

    setUser(user)
  }, [router])

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    router.push('/admin-login')
  }

  if (!user) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
      }}>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Loading admin panel...
        </Typography>
      </Box>
    )
  }

  const adminMenuItems = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: <People sx={{ fontSize: 40, color: '#dc2626' }} />,
      href: '/dashboard/admin',
      color: '#fef2f2'
    },
    {
      title: 'Organizations',
      description: 'View and manage organization data',
      icon: <Business sx={{ fontSize: 40, color: '#059669' }} />,
      href: '/dashboard/admin',
      color: '#f0fdf4'
    },
    {
      title: 'System Security',
      description: 'Security logs and system monitoring',
      icon: <Security sx={{ fontSize: 40, color: '#7c3aed' }} />,
      href: '/dashboard/admin',
      color: '#f5f3ff'
    },
    {
      title: 'Settings',
      description: 'Application configuration and settings',
      icon: <Settings sx={{ fontSize: 40, color: '#ea580c' }} />,
      href: '/dashboard/admin',
      color: '#fff7ed'
    }
  ]

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      {/* Admin Header */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Toolbar>
          <AdminPanelSettings sx={{ mr: 2, color: '#dc2626' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Nexopeak Admin Portal
          </Typography>
          
          <Chip
            label="ADMIN"
            size="small"
            sx={{
              mr: 2,
              backgroundColor: '#dc2626',
              color: 'white',
              fontWeight: 600
            }}
          />

          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        id="primary-search-account-menu"
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
        <MenuItem disabled>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              {user.email}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ 
            fontWeight: 700, 
            color: '#1e293b',
            mb: 2
          }}>
            Welcome back, {user.name}
          </Typography>
          <Typography variant="h6" sx={{ color: '#64748b', mb: 3 }}>
            Admin Dashboard - Nexopeak System Administration
          </Typography>
          
          <Card sx={{ 
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            color: 'white',
            mb: 4
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    System Status: All Operational
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    All services running normally. Last check: {new Date().toLocaleTimeString()}
                  </Typography>
                </Box>
                <DashboardIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions Grid */}
        <Typography variant="h5" sx={{ 
          fontWeight: 600, 
          color: '#1e293b',
          mb: 3
        }}>
          Administration Tools
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
          gap: 3,
          mb: 4
        }}>
          {adminMenuItems.map((item, index) => (
            <Card 
              key={index}
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Link href={item.href} style={{ textDecoration: 'none' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2
                  }}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: item.color,
                      mr: 3
                    }}>
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        color: '#1e293b',
                        mb: 0.5
                      }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#64748b' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Link>
            </Card>
          ))}
        </Box>

        {/* Quick Links */}
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600,
              color: '#1e293b',
              mb: 3
            }}>
              Quick Access
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="outlined"
                  sx={{ 
                    borderColor: '#dc2626',
                    color: '#dc2626',
                    '&:hover': { 
                      borderColor: '#b91c1c',
                      backgroundColor: 'rgba(220, 38, 38, 0.04)'
                    }
                  }}
                >
                  View Main Site
                </Button>
              </Link>
              <Link href="/dashboard/admin" style={{ textDecoration: 'none' }}>
                <Button 
                  variant="contained"
                  sx={{ 
                    background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    }
                  }}
                >
                  Full Admin Panel
                </Button>
              </Link>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
