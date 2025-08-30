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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import {
  ArrowBack,
  Business,
  Search,
  AccountCircle,
  Logout,
  Add,
  Edit,
  TrendingUp,
  People,
  MonetizationOn,
  Analytics,
} from '@mui/icons-material'
import Link from 'next/link'

export default function ClientManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated and is admin
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user_data')
    
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
    localStorage.removeItem('user_data')
    router.push('/admin-login')
  }

  // Mock client data (replace with real API call)
  const clients = [
    {
      id: 1,
      name: 'Acme Corporation',
      industry: 'Technology',
      plan: 'Enterprise',
      users: 25,
      ga4Properties: 3,
      monthlyRevenue: 2499,
      joinDate: '2024-06-15',
      status: 'active',
      primaryContact: 'john.doe@acme.com',
      lastLogin: '2025-01-15 16:30'
    },
    {
      id: 2,
      name: 'TechStart Inc',
      industry: 'Startup',
      plan: 'Professional',
      users: 8,
      ga4Properties: 1,
      monthlyRevenue: 299,
      joinDate: '2024-11-02',
      status: 'active',
      primaryContact: 'sarah@techstart.com',
      lastLogin: '2025-01-14 09:15'
    },
    {
      id: 3,
      name: 'Global Retail Solutions',
      industry: 'E-commerce',
      plan: 'Enterprise',
      users: 45,
      ga4Properties: 8,
      monthlyRevenue: 4999,
      joinDate: '2024-03-20',
      status: 'active',
      primaryContact: 'mike@globalretail.com',
      lastLogin: '2025-01-15 14:22'
    },
    {
      id: 4,
      name: 'Digital Marketing Agency',
      industry: 'Marketing',
      plan: 'Professional',
      users: 12,
      ga4Properties: 15,
      monthlyRevenue: 599,
      joinDate: '2024-08-10',
      status: 'trial',
      primaryContact: 'lisa@agency.com',
      lastLogin: '2025-01-13 11:45'
    },
    {
      id: 5,
      name: 'Local Business Hub',
      industry: 'Services',
      plan: 'Basic',
      users: 3,
      ga4Properties: 1,
      monthlyRevenue: 99,
      joinDate: '2024-12-01',
      status: 'suspended',
      primaryContact: 'owner@localbiz.com',
      lastLogin: '2025-01-10 08:30'
    }
  ]

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />
      case 'trial':
        return <Chip label="Trial" color="info" size="small" />
      case 'suspended':
        return <Chip label="Suspended" color="error" size="small" />
      default:
        return <Chip label="Unknown" size="small" />
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Basic': return '#6b7280'
      case 'Professional': return '#3b82f6'
      case 'Enterprise': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.primaryContact.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = clients.reduce((sum, client) => sum + client.monthlyRevenue, 0)
  const totalUsers = clients.reduce((sum, client) => sum + client.users, 0)
  const totalProperties = clients.reduce((sum, client) => sum + client.ga4Properties, 0)

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
          <Business sx={{ mr: 2, color: '#ef4444' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Client Management
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
                <Business sx={{ fontSize: 40, color: '#dc2626', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="h1" fontWeight={700} color="#1e3a8a">
                    Client Organizations
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Manage client accounts, subscriptions, and organization settings
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => setOpenAddDialog(true)}
                sx={{ 
                  backgroundColor: '#dc2626', 
                  '&:hover': { backgroundColor: '#b91c1c' }
                }}
              >
                Add New Client
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 40, color: '#1e3a8a', mb: 1 }} />
              <Typography variant="h3" fontWeight={700} color="#1e3a8a">
                {clients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Clients
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MonetizationOn sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
              <Typography variant="h3" fontWeight={700} color="#10b981">
                ${totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monthly Revenue
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: '#3b82f6', mb: 1 }} />
              <Typography variant="h3" fontWeight={700} color="#3b82f6">
                {totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Users
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h3" fontWeight={700} color="#f59e0b">
                {totalProperties}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GA4 Properties
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 4, backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <TextField
              placeholder="Search clients, industries, or contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ minWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <CardContent>
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Organization</strong></TableCell>
                    <TableCell><strong>Plan</strong></TableCell>
                    <TableCell><strong>Users</strong></TableCell>
                    <TableCell><strong>GA4 Properties</strong></TableCell>
                    <TableCell><strong>Monthly Revenue</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Primary Contact</strong></TableCell>
                    <TableCell><strong>Last Login</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>
                        <Box>
                          <Typography fontWeight={600}>{client.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {client.industry} • Joined {new Date(client.joinDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={client.plan} 
                          size="small"
                          sx={{ 
                            backgroundColor: `${getPlanColor(client.plan)}20`,
                            color: getPlanColor(client.plan),
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{client.users}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={500}>{client.ga4Properties}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600} color="#10b981">
                          ${client.monthlyRevenue}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(client.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{client.primaryContact}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{client.lastLogin}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Button size="small" variant="outlined" startIcon={<Edit />}>
                            Edit
                          </Button>
                          <Button size="small" variant="outlined" startIcon={<TrendingUp />}>
                            Analytics
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredClients.length === 0 && (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  No clients found matching your search criteria.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add Client Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client Organization</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <TextField label="Organization Name" fullWidth />
            <TextField label="Industry" fullWidth />
            <TextField label="Primary Contact Email" fullWidth />
            <FormControl fullWidth>
              <InputLabel>Subscription Plan</InputLabel>
              <Select label="Subscription Plan">
                <MenuItem value="Basic">Basic - $99/month</MenuItem>
                <MenuItem value="Professional">Professional - $299/month</MenuItem>
                <MenuItem value="Enterprise">Enterprise - $999/month</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Initial Users" type="number" fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button variant="contained" sx={{ backgroundColor: '#dc2626' }}>
            Create Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
