'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material'
import {
  BarChart as BarChartIcon,
  Person as UserIcon,
  Link as LinkIcon,
  Description as FileTextIcon,
  AutoAwesome as SparklesIcon,
  Menu as MenuIcon,
  Logout as LogOutIcon,
  Notifications as NotificationsIcon,
  Analytics as AnalyticsIcon,
  BugReport as BugReportIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material'
import UserDropdown from './components/UserDropdown'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

const getNavigation = (userRole?: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChartIcon },
    { name: 'Campaigns', href: '/dashboard/campaigns', icon: CampaignIcon },
    { name: 'Campaign Analyzer', href: '/dashboard/campaign-analyzer', icon: AnalyticsIcon },
    { name: 'Campaign Generator', href: '/dashboard/campaign-generator', icon: SparklesIcon },
    { name: 'Connections', href: '/dashboard/connections', icon: LinkIcon },
    { name: 'Reports', href: '/dashboard/reports', icon: FileTextIcon },
  ]
  
  // Add admin-only items
  if (userRole === 'admin') {
    baseNavigation.push(
      { name: 'System Logs', href: '/dashboard/logs', icon: BugReportIcon },
      { name: 'Admin Panel', href: '/dashboard/admin', icon: UserIcon }
    )
  }
  
  return baseNavigation
}

const drawerWidth = 280

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [campaigns, setCampaigns] = useState<Array<{id: string, name: string, status: string, type: string}>>([])
  const [userRole, setUserRole] = useState<string>('')
  const pathname = usePathname()
  
  const navigation = getNavigation(userRole)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('demo_user') // Keep for backward compatibility
    window.location.href = '/auth/login'
  }

  // Load user data and campaigns
  useEffect(() => {
    const loadUserData = () => {
      try {
        const userData = localStorage.getItem('user_data')
        if (userData) {
          const user = JSON.parse(userData)
          setUserRole(user.role || 'user')
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      }
    }

    const loadCampaigns = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          setCampaigns([])
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'}/api/v1/campaigns`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setCampaigns(data.campaigns || [])
          
          // Set first active campaign as selected
          if (data.campaigns && data.campaigns.length > 0) {
            const activeCampaign = data.campaigns.find((c: any) => c.status === 'active')
            if (activeCampaign) {
              setSelectedCampaign(activeCampaign.id)
            } else {
              setSelectedCampaign(data.campaigns[0].id)
            }
          }
        } else {
          setCampaigns([])
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error)
        setCampaigns([])
      }
    }

    loadUserData()
    loadCampaigns()
  }, [])

  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaign(campaignId)
    // You can add logic here to filter data based on selected campaign
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'paused': return 'warning'
      case 'draft': return 'default'
      case 'completed': return 'info'
      default: return 'default'
    }
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: '#f97316',
              width: 40,
              height: 40,
              mr: 2,
            }}
          >
            <SparklesIcon />
          </Avatar>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #f97316, #fb923c)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Nexopeak
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 2, py: 2 }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <ListItem key={item.name} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    bgcolor: '#fef3c7',
                    color: '#f97316',
                    '&:hover': {
                      bgcolor: '#fde68a',
                    },
                  },
                  '&:hover': {
                    bgcolor: '#f9fafb',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#f97316' : '#6b7280',
                    minWidth: 40,
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>


    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            position: 'relative',
            height: '100vh',
            flexShrink: 0,
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // Prevents content from overflowing
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: '#ffffff',
            borderBottom: 1,
            borderColor: '#e5e7eb',
            color: '#111827',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Campaign Selector */}
              {campaigns.length > 0 && (
                <>
                  <FormControl size="small" sx={{ minWidth: 200, display: { xs: 'none', md: 'block' } }}>
                    <InputLabel sx={{ color: '#6b7280' }}>Campaign</InputLabel>
                    <Select
                      value={selectedCampaign}
                      onChange={(e) => handleCampaignChange(e.target.value)}
                      label="Campaign"
                      sx={{
                        bgcolor: '#f9fafb',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#e5e7eb',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f97316',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#f97316',
                        },
                      }}
                    >
                      {campaigns.map((campaign: any) => (
                        <MenuItem key={campaign.id} value={campaign.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {campaign.name}
                            </Typography>
                            <Chip 
                              label={campaign.status} 
                              size="small" 
                              color={getStatusColor(campaign.status)}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Divider orientation="vertical" flexItem />
                </>
              )}

              <IconButton color="inherit" sx={{ position: 'relative' }}>
                <NotificationsIcon />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    bgcolor: '#dc2626',
                    borderRadius: '50%',
                  }}
                />
              </IconButton>

              <Divider orientation="vertical" flexItem />

              <UserDropdown />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
