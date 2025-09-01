'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material'
import {
  ArrowBack,
  Search,
  Link as LinkIcon,
  CheckCircle,
  Error,
  Warning,
  Refresh,
  AccountCircle,
  Logout,
  Download,
} from '@mui/icons-material'
import Link from 'next/link'

export default function GA4ConnectionsAdminPage() {
  const [user, setUser] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
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

  const [ga4Connections, setGa4Connections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    connected: 0,
    error: 0,
    warning: 0
  })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'

  // Fetch GA4 connections from API
  const fetchGA4Connections = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        router.push('/admin-login')
        return
      }

      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      params.append('limit', '100')
      params.append('offset', '0')

      const response = await fetch(`${apiUrl}/api/v1/admin/ga4-connections?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.status === 401) {
        router.push('/admin-login')
        return
      }

      if (!response.ok) {
        throw new (Error as any)(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setGa4Connections(data.connections || [])
      setStatusCounts(data.status_counts || {})
      setError('')
    } catch (err) {
      console.error('Error fetching GA4 connections:', err)
      setError('Failed to load GA4 connections')
      setGa4Connections([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGA4Connections()
  }, [searchTerm, filterStatus])

  // Format data for display - TypeScript fix applied
  const formatConnectionData = (connection: any) => ({
    id: connection.id,
    organization: connection.organization_name,
    propertyId: connection.property_id,
    propertyName: connection.property_name,
    status: connection.status,
    lastSync: connection.last_sync ? new Date(connection.last_sync).toLocaleString() : 'Never',
    events: connection.events_24h?.toLocaleString() || '0',
    apiCalls: connection.api_calls_today?.toLocaleString() || '0',
    dataQuality: connection.data_quality,
    owner: connection.owner_email
  })

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'connected':
        return <Chip label="Connected" color="success" size="small" icon={<CheckCircle />} />
      case 'error':
        return <Chip label="Error" color="error" size="small" icon={<Error />} />
      case 'warning':
        return <Chip label="Warning" color="warning" size="small" icon={<Warning />} />
      default:
        return <Chip label="Unknown" size="small" />
    }
  }

  const getDataQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return '#10b981'
      case 'good': return '#f59e0b'
      case 'poor': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const displayConnections = ga4Connections.map(formatConnectionData)

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%)'
    }}>
      {/* Header */}
      <AppBar position="static" sx={{ backgroundColor: 'rgba(30, 58, 138, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Link href="/admin-dashboard" style={{ textDecoration: 'none', color: 'inherit', marginRight: '16px' }}>
            <IconButton color="inherit">
              <ArrowBack />
            </IconButton>
          </Link>
          <LinkIcon sx={{ mr: 2, color: '#ef4444' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            GA4 Connections Management
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
            aria-label="account menu"
            onClick={handleMenuClick}
            color="inherit"
          >
            <Avatar sx={{ bgcolor: '#ef4444', width: 32, height: 32 }}>
              {user.name?.charAt(0) || user.email?.charAt(0) || 'A'}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
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

      {/* Content */}
      <Box sx={{ p: 4 }}>
        {/* Page Header */}
        <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center">
                <LinkIcon sx={{ fontSize: 40, color: '#dc2626', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="h1" fontWeight={700} color="#1e3a8a">
                    GA4 Connections Overview
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Monitor all Google Analytics 4 integrations across client organizations
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<Refresh />}
                  sx={{ 
                    borderColor: '#dc2626', 
                    color: '#dc2626',
                    '&:hover': { borderColor: '#b91c1c', backgroundColor: 'rgba(220, 38, 38, 0.04)' }
                  }}
                >
                  Sync All
                </Button>
                <Button 
                  variant="contained" 
                  startIcon={<Download />}
                  sx={{ 
                    backgroundColor: '#dc2626', 
                    '&:hover': { backgroundColor: '#b91c1c' }
                  }}
                >
                  Export Report
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Status Overview Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="#1e3a8a">
                {loading ? '...' : (statusCounts.total || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Connections
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="#10b981">
                {loading ? '...' : (statusCounts.connected || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active & Healthy
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="#f59e0b">
                {loading ? '...' : (statusCounts.warning || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need Attention
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} color="#ef4444">
                {loading ? '...' : (statusCounts.error || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Issues
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters and Search */}
        <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <TextField
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{ minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Button 
                variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('all')}
                size="small"
                disabled={loading}
              >
                All ({loading ? '...' : (statusCounts.total || 0)})
              </Button>
              <Button 
                variant={filterStatus === 'connected' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('connected')}
                size="small"
                color="success"
                disabled={loading}
              >
                Connected ({loading ? '...' : (statusCounts.connected || 0)})
              </Button>
              <Button 
                variant={filterStatus === 'warning' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('warning')}
                size="small"
                color="warning"
                disabled={loading}
              >
                Warning ({loading ? '...' : (statusCounts.warning || 0)})
              </Button>
              <Button 
                variant={filterStatus === 'error' ? 'contained' : 'outlined'}
                onClick={() => setFilterStatus('error')}
                size="small"
                color="error"
                disabled={loading}
              >
                Error ({loading ? '...' : (statusCounts.error || 0)})
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Connections Table */}
        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Organization</strong></TableCell>
                    <TableCell><strong>GA4 Property</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Last Sync</strong></TableCell>
                    <TableCell><strong>Events (24h)</strong></TableCell>
                    <TableCell><strong>API Calls</strong></TableCell>
                    <TableCell><strong>Data Quality</strong></TableCell>
                    <TableCell><strong>Owner</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Loading connections...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : displayConnections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No connections found matching your criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayConnections.map((connection: any) => (
                      <TableRow key={connection.id} hover>
                        <TableCell>
                          <Typography fontWeight={600}>{connection.organization}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {connection.propertyName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {connection.propertyId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(connection.status)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{connection.lastSync}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {connection.events}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{connection.apiCalls}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={connection.dataQuality} 
                            size="small"
                            sx={{ 
                              backgroundColor: `${getDataQualityColor(connection.dataQuality)}20`,
                              color: getDataQualityColor(connection.dataQuality),
                              fontWeight: 500
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{connection.owner}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Button size="small" variant="outlined">
                              View
                            </Button>
                            <Button size="small" variant="outlined" color="warning">
                              Test
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>


          </CardContent>
        </Card>

        {/* System Alerts */}
        {statusCounts.error > 0 && (
          <Box sx={{ mt: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              <strong>Action Required:</strong> {statusCounts.error} GA4 connection{statusCounts.error > 1 ? 's have' : ' has'} critical issues that need immediate attention.
            </Alert>
          </Box>
        )}
        
        {statusCounts.warning > 0 && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="warning">
              <strong>Attention:</strong> {statusCounts.warning} GA4 connection{statusCounts.warning > 1 ? 's need' : ' needs'} monitoring due to potential issues.
            </Alert>
          </Box>
        )}
      </Box>
    </Box>
  )
}
