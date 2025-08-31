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
  Alert,
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
  const [newClientData, setNewClientData] = useState({
    name: '',
    industry: '',
    primary_contact_email: '',
    plan: '',
    initial_users: 1
  })
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

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalProperties, setTotalProperties] = useState(0)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        router.push('/admin-login')
        return
      }

      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      params.append('limit', '100')
      params.append('offset', '0')

      const response = await fetch(`${apiUrl}/api/v1/admin/clients?${params}`, {
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
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setClients(data.clients || [])
      setTotalRevenue(data.total_revenue || 0)
      setTotalUsers(data.total_users || 0)
      setTotalProperties(data.total_properties || 0)
      setError('')
    } catch (err) {
      console.error('Error fetching clients:', err)
      setError('Failed to load clients')
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [searchTerm])

  // Handle create client
  const handleCreateClient = async (clientData: any) => {
    try {
      const token = localStorage.getItem('access_token')
      
      const response = await fetch(`${apiUrl}/api/v1/admin/clients`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh the clients list
      fetchClients()
      setOpenAddDialog(false)
      
      // Reset form
      setNewClientData({
        name: '',
        industry: '',
        primary_contact_email: '',
        plan: '',
        initial_users: 1
      })
      
      // Show success message (you could add a snackbar here)
      console.log('Client created successfully')
    } catch (err) {
      console.error('Error creating client:', err)
      setError('Failed to create client')
    }
  }

  const handleCloseDialog = () => {
    setOpenAddDialog(false)
    setNewClientData({
      name: '',
      industry: '',
      primary_contact_email: '',
      plan: '',
      initial_users: 1
    })
  }

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

  // Format client data for display
  const formatClientData = (client: any) => ({
    id: client.id,
    name: client.name,
    industry: client.industry,
    plan: client.plan,
    users_count: client.users_count,
    ga4_properties_count: client.ga4_properties_count,
    monthly_revenue: client.monthly_revenue,
    join_date: new Date(client.join_date).toLocaleDateString(),
    status: client.status,
    primary_contact: client.primary_contact,
    last_login: client.last_login ? new Date(client.last_login).toLocaleString() : 'Never'
  })

  const displayClients = clients.map(formatClientData)

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

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mb: 4 }}>
          <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Business sx={{ fontSize: 40, color: '#1e3a8a', mb: 1 }} />
              <Typography variant="h3" fontWeight={700} color="#1e3a8a">
                {loading ? '...' : clients.length}
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
                {loading ? '...' : `$${totalRevenue.toLocaleString()}`}
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
                {loading ? '...' : totalUsers}
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
                {loading ? '...' : totalProperties}
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Loading clients...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : displayClients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No clients found matching your search criteria.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayClients.map((client: any) => (
                      <TableRow key={client.id} hover>
                        <TableCell>
                          <Box>
                            <Typography fontWeight={600}>{client.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.industry} • Joined {client.join_date}
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
                          <Typography fontWeight={500}>{client.users_count}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>{client.ga4_properties_count}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600} color="#10b981">
                            ${client.monthly_revenue}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {getStatusChip(client.status)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{client.primary_contact}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{client.last_login}</Typography>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>


          </CardContent>
        </Card>
      </Box>

      {/* Add Client Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Add New Client Organization</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <TextField 
              label="Organization Name" 
              fullWidth 
              value={newClientData.name}
              onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
              required
            />
            <TextField 
              label="Industry" 
              fullWidth 
              value={newClientData.industry}
              onChange={(e) => setNewClientData({...newClientData, industry: e.target.value})}
            />
            <TextField 
              label="Primary Contact Email" 
              fullWidth 
              type="email"
              value={newClientData.primary_contact_email}
              onChange={(e) => setNewClientData({...newClientData, primary_contact_email: e.target.value})}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Subscription Plan</InputLabel>
              <Select 
                label="Subscription Plan"
                value={newClientData.plan}
                onChange={(e) => setNewClientData({...newClientData, plan: e.target.value})}
              >
                <MenuItem value="Basic">Basic - $99/month</MenuItem>
                <MenuItem value="Professional">Professional - $299/month</MenuItem>
                <MenuItem value="Enterprise">Enterprise - $999/month</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Initial Users" 
              type="number" 
              fullWidth 
              value={newClientData.initial_users}
              onChange={(e) => setNewClientData({...newClientData, initial_users: parseInt(e.target.value) || 1})}
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            sx={{ backgroundColor: '#dc2626' }}
            onClick={() => handleCreateClient(newClientData)}
            disabled={!newClientData.name || !newClientData.primary_contact_email || !newClientData.plan}
          >
            Create Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
