'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Divider
} from '@mui/material'
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon,
  Campaign as CampaignIcon,
  Link as LinkIcon,
  Visibility as ViewIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  Google as GoogleIcon,
  Web as WebIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  org_id: string
  organization_name?: string
  created_at: string
  last_login?: string
  is_active: boolean
}

interface Campaign {
  id: string
  name: string
  description?: string
  status: 'active' | 'paused' | 'draft' | 'completed' | 'archived'
  platform: string
  campaign_type: string
  primary_objective: string
  total_budget?: number
  daily_budget?: number
  currency: string
  start_date?: string
  end_date?: string
  target_locations: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Connection {
  id: string
  name: string
  type: string
  platform: string
  status: 'active' | 'inactive' | 'error'
  created_at: string
  last_sync?: string
  config?: any
}

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user' as 'user' | 'admin',
    is_active: true
  })
  
  // New state for user details view
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null)
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>([])
  const [userConnections, setUserConnections] = useState<Connection[]>([])
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [tabValue, setTabValue] = useState(0)
  const [loadingUserData, setLoadingUserData] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/admin-login')
        return
      }

      const response = await fetch(`${apiUrl}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin-login')
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search and role filter
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Handle user update
  const handleUpdateUser = async () => {
    if (!selectedUser) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${apiUrl}/api/v1/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setSuccess('User updated successfully!')
      setOpenDialog(false)
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error)
      setError('Failed to update user. Please try again.')
    }
  }

  // Fetch user-specific campaigns
  const fetchUserCampaigns = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}/campaigns`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserCampaigns(data.campaigns || [])
      } else {
        setUserCampaigns([])
      }
    } catch (error) {
      console.error('Error fetching user campaigns:', error)
      setUserCampaigns([])
    }
  }

  // Fetch user-specific connections
  const fetchUserConnections = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}/connections`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUserConnections(data.connections || [])
      } else {
        setUserConnections([])
      }
    } catch (error) {
      console.error('Error fetching user connections:', error)
      setUserConnections([])
    }
  }

  // Handle viewing user details
  const handleViewUser = async (user: User) => {
    setSelectedUserForView(user)
    setViewDialogOpen(true)
    setLoadingUserData(true)
    setTabValue(0)
    
    // Fetch user's campaigns and connections
    await Promise.all([
      fetchUserCampaigns(user.id),
      fetchUserConnections(user.id)
    ])
    
    setLoadingUserData(false)
  }

  // Helper functions for rendering
  const getChannelIcon = (platform: string) => {
    const platformLower = platform.toLowerCase()
    const iconProps = { sx: { fontSize: 20 } }
    
    if (platformLower.includes('facebook')) return <FacebookIcon {...iconProps} />
    if (platformLower.includes('instagram')) return <InstagramIcon {...iconProps} />
    if (platformLower.includes('linkedin')) return <LinkedInIcon {...iconProps} />
    if (platformLower.includes('twitter')) return <TwitterIcon {...iconProps} />
    if (platformLower.includes('google')) return <GoogleIcon {...iconProps} />
    if (platformLower.includes('youtube')) return <YouTubeIcon {...iconProps} />
    return <WebIcon {...iconProps} />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'paused': return 'warning'
      case 'draft': return 'default'
      case 'completed': return 'info'
      case 'archived': return 'error'
      case 'inactive': return 'warning'
      case 'error': return 'error'
      default: return 'default'
    }
  }

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    })
    setOpenDialog(true)
  }


  // Get role chip color
  const getRoleChipColor = (role: string) => {
    switch (role) {
      case 'admin':
        return { color: '#dc2626', bgcolor: '#fef2f2' }
      case 'user':
        return { color: '#059669', bgcolor: '#f0fdf4' }
      default:
        return { color: '#6b7280', bgcolor: '#f9fafb' }
    }
  }

  // Get status chip color
  const getStatusChipColor = (isActive: boolean) => {
    return isActive 
      ? { color: '#059669', bgcolor: '#f0fdf4' }
      : { color: '#dc2626', bgcolor: '#fef2f2' }
  }

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <CircularProgress sx={{ color: 'white' }} size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%)',
      p: 3
    }}>
      <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PersonIcon sx={{ fontSize: 40, color: 'white', mr: 2 }} />
            <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
              User Management
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Manage users, roles, and access permissions across the platform
          </Typography>
        </Box>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ minWidth: 300 }}
              />
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Role Filter</InputLabel>
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  label="Role Filter"
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh Users">
                  <IconButton onClick={fetchUsers} sx={{ color: '#dc2626' }}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Registered Users ({filteredUsers.length})
              </Typography>
            </Box>

            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>User</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Organization</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell><strong>Last Login</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user: any) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {user.role === 'admin' ? (
                            <AdminIcon sx={{ mr: 1, color: '#dc2626' }} />
                          ) : (
                            <PersonIcon sx={{ mr: 1, color: '#6b7280' }} />
                          )}
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 1, color: '#6b7280', fontSize: 16 }} />
                          <Typography variant="body2">
                            {user.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.toUpperCase()}
                          size="small"
                          sx={{
                            ...getRoleChipColor(user.role),
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BusinessIcon sx={{ mr: 1, color: '#6b7280', fontSize: 16 }} />
                          <Typography variant="body2">
                            {user.organization_name || 'No Organization'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            ...getStatusChipColor(user.is_active),
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarIcon sx={{ mr: 1, color: '#6b7280', fontSize: 16 }} />
                          <Typography variant="body2">
                            {formatDate(user.created_at)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {user.last_login ? formatDate(user.last_login) : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="View Campaigns & Connections">
                            <IconButton 
                              onClick={() => handleViewUser(user)}
                              size="small"
                              sx={{ color: '#1976d2' }}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton 
                              onClick={() => openEditDialog(user)}
                              size="small"
                              sx={{ color: '#dc2626' }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                          No users found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                fullWidth
                type="email"
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'user' | 'admin' })}
                  label="Role"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editForm.is_active ? 'true' : 'false'}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.value === 'true' })}
                  label="Status"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleUpdateUser}
              variant="contained"
              sx={{ 
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)' }
              }}
            >
              Update User
            </Button>
          </DialogActions>
        </Dialog>

        {/* User Details Dialog */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  {selectedUserForView?.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {selectedUserForView?.email}
                </Typography>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab 
                  label={`Campaigns (${userCampaigns.length})`} 
                  icon={<CampaignIcon />}
                  iconPosition="start"
                />
                <Tab 
                  label={`Connections (${userConnections.length})`} 
                  icon={<LinkIcon />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {loadingUserData ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {/* Campaigns Tab */}
                {tabValue === 0 && (
                  <Box>
                    {userCampaigns.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CampaignIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#6b7280' }}>
                          No campaigns found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          This user hasn't created any campaigns yet.
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {userCampaigns.map((campaign) => (
                          <Grid item xs={12} md={6} key={campaign.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getChannelIcon(campaign.platform)}
                                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                      {campaign.name}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={campaign.status}
                                    size="small"
                                    color={getStatusColor(campaign.status) as any}
                                    variant="outlined"
                                  />
                                </Box>
                                
                                {campaign.description && (
                                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                                    {campaign.description.length > 100 
                                      ? campaign.description.substring(0, 100) + '...'
                                      : campaign.description}
                                  </Typography>
                                )}

                                <Stack spacing={1}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                      Platform:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {campaign.platform}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                      Objective:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {campaign.primary_objective}
                                    </Typography>
                                  </Box>

                                  {campaign.total_budget && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Total Budget:
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {formatCurrency(campaign.total_budget, campaign.currency)}
                                      </Typography>
                                    </Box>
                                  )}

                                  {campaign.daily_budget && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Daily Budget:
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {formatCurrency(campaign.daily_budget, campaign.currency)}
                                      </Typography>
                                    </Box>
                                  )}

                                  <Divider sx={{ my: 1 }} />
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                      Created:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {formatDate(campaign.created_at)}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}

                {/* Connections Tab */}
                {tabValue === 1 && (
                  <Box>
                    {userConnections.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <LinkIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#6b7280' }}>
                          No connections found
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                          This user hasn't set up any integrations yet.
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {userConnections.map((connection) => (
                          <Grid item xs={12} md={6} key={connection.id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getChannelIcon(connection.platform)}
                                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                                      {connection.name}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={connection.status}
                                    size="small"
                                    color={getStatusColor(connection.status) as any}
                                    variant="outlined"
                                  />
                                </Box>

                                <Stack spacing={1}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                      Type:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {connection.type}
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                      Platform:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {connection.platform}
                                    </Typography>
                                  </Box>

                                  <Divider sx={{ my: 1 }} />
                                  
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                      Created:
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {formatDate(connection.created_at)}
                                    </Typography>
                                  </Box>

                                  {connection.last_sync && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                        Last Sync:
                                      </Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {formatDate(connection.last_sync)}
                                      </Typography>
                                    </Box>
                                  )}
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}
