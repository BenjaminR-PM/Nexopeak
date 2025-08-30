'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Box,
  Grid,
  IconButton,
  Alert,
  TableContainer,
  Paper,
  Divider,
} from '@mui/material'
import {
  Person as Users,
  Business as Building,
  Timeline as Activity,
  Warning as AlertTriangle,
  Security as Shield,
  Settings,
  Delete as Trash2,
  Edit,
  Refresh as RefreshCw,
  Download,
  Search,
  FilterList as Filter,
  TrendingUp,
  TrendingDown,
  Storage as Database,
  Computer as Server,
  Memory,
  CheckCircle,
  Cancel as XCircle,
  AccessTime as Clock
} from '@mui/icons-material'

interface AdminStats {
  total_users: number
  total_organizations: number
  total_connections: number
  total_campaigns: number
  active_users_today: number
  new_users_this_week: number
  users_by_role: Record<string, number>
  organizations_by_status: Record<string, number>
  system_health: Record<string, string>
}

interface User {
  id: string
  email: string
  name: string
  role: string
  org_id: string
  is_active?: boolean
  is_verified?: boolean
  last_login_at?: string
  created_at?: string
}

interface OrganizationStats {
  id: string
  name: string
  domain: string
  user_count: number
  connection_count: number
  campaign_count: number
  created_at: string
  last_activity?: string
}

interface SystemHealth {
  database_status: string
  redis_status: string
  logging_status: string
  external_apis_status: Record<string, string>
  disk_usage: Record<string, any>
  memory_usage: Record<string, any>
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

const ROLE_COLORS = {
  admin: 'error',
  analyst: 'primary',
  viewer: 'success',
  user: 'default'
} as const

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [organizations, setOrganizations] = useState<OrganizationStats[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userFilter, setUserFilter] = useState({ role: '', search: '', isActive: '' })
  const [activeTab, setActiveTab] = useState(0)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/stats`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch admin stats:', response.status)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams()
      if (userFilter.role) params.append('role', userFilter.role)
      if (userFilter.search) params.append('search', userFilter.search)
      if (userFilter.isActive) params.append('is_active', userFilter.isActive)

      const response = await fetch(`${apiUrl}/api/v1/admin/users?${params}`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/organizations`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setOrganizations(data)
      }
    } catch (error) {
      console.error('Error fetching organizations:', error)
    }
  }

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/system/health`, {
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const data = await response.json()
        setSystemHealth(data)
      }
    } catch (error) {
      console.error('Error fetching system health:', error)
    }
  }

  const updateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      })
      if (response.ok) {
        await fetchUsers()
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return

    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (response.ok) {
        await fetchUsers()
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const performMaintenance = async (action: string) => {
    setLoading(true)
    try {
      const response = await fetch(`${apiUrl}/api/v1/admin/system/maintenance?action=${action}`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      if (response.ok) {
        const result = await response.json()
        alert(`Maintenance completed: ${JSON.stringify(result.details)}`)
        await fetchSystemHealth()
      }
    } catch (error) {
      console.error('Error performing maintenance:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is admin
    const userData = localStorage.getItem('user_data')
    if (userData) {
      const user = JSON.parse(userData)
      if (user.role !== 'admin') {
        window.location.href = '/dashboard'
        return
      }
    }

    fetchAdminStats()
    fetchUsers()
    fetchOrganizations()
    fetchSystemHealth()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [userFilter])

  if (!stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <RefreshCw sx={{ animation: 'spin 1s linear infinite' }} />
        <Typography sx={{ ml: 2 }}>Loading admin panel...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Shield />
            Admin Panel
          </Typography>
          <Typography variant="body1" color="textSecondary">
            System administration and user management
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshCw />}
          onClick={() => {
            fetchAdminStats()
            fetchUsers()
            fetchOrganizations()
            fetchSystemHealth()
          }}
        >
          Refresh All
        </Button>
      </Box>

      {/* Admin Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} aria-label="admin tabs">
            <Tab label="Overview" />
            <Tab label="Users" />
            <Tab label="Organizations" />
            <Tab label="System Health" />
          </Tabs>
        </Box>

        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Users
                      </Typography>
                      <Typography variant="h4">
                        {stats.total_users}
                      </Typography>
                    </Box>
                    <Users color="primary" sx={{ fontSize: 40 }} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{stats.new_users_this_week} this week
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Organizations
                      </Typography>
                      <Typography variant="h4">
                        {stats.total_organizations}
                      </Typography>
                    </Box>
                    <Building color="secondary" sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {stats.organizations_by_status.active} active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Active Today
                      </Typography>
                      <Typography variant="h4">
                        {stats.active_users_today}
                      </Typography>
                    </Box>
                    <Activity color="success" sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {((stats.active_users_today / stats.total_users) * 100).toFixed(1)}% of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        System Status
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        Healthy
                      </Typography>
                    </Box>
                    <CheckCircle color="success" sx={{ fontSize: 40 }} />
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    All systems operational
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Role Distribution */}
          <Card>
            <CardHeader title="User Role Distribution" />
            <CardContent>
              <Grid container spacing={3}>
                {Object.entries(stats.users_by_role).map(([role, count]) => (
                  <Grid item xs={6} md={3} key={role}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4">{count}</Typography>
                      <Chip 
                        label={role.charAt(0).toUpperCase() + role.slice(1)}
                        color={ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'default'}
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardHeader title="User Management" />
            <CardContent>
              {/* User Filters */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search users..."
                    value={userFilter.search}
                    onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                    InputProps={{
                      startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={userFilter.role}
                      label="Role"
                      onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
                    >
                      <MenuItem value="">All Roles</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                      <MenuItem value="analyst">Analyst</MenuItem>
                      <MenuItem value="viewer">Viewer</MenuItem>
                      <MenuItem value="user">User</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={userFilter.isActive}
                      label="Status"
                      onChange={(e) => setUserFilter({ ...userFilter, isActive: e.target.value })}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">{user.name}</Typography>
                            <Typography variant="body2" color="textSecondary">{user.email}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role}
                            color={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.org_id}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.is_active ? "Active" : "Inactive"}
                            color={user.is_active ? "success" : "default"}
                            variant={user.is_active ? "filled" : "outlined"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Organizations Tab */}
        <TabPanel value={activeTab} index={2}>
          <Card>
            <CardHeader title="Organization Statistics" />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Organization</TableCell>
                      <TableCell>Users</TableCell>
                      <TableCell>Connections</TableCell>
                      <TableCell>Campaigns</TableCell>
                      <TableCell>Last Activity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2">{org.name}</Typography>
                            <Typography variant="body2" color="textSecondary">{org.domain}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{org.user_count}</TableCell>
                        <TableCell>{org.connection_count}</TableCell>
                        <TableCell>{org.campaign_count}</TableCell>
                        <TableCell>
                          {org.last_activity ? new Date(org.last_activity).toLocaleDateString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* System Health Tab */}
        <TabPanel value={activeTab} index={3}>
          {systemHealth && (
            <Box>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography color="textSecondary" gutterBottom>
                            Database
                          </Typography>
                          <Typography variant="h6">{systemHealth.database_status}</Typography>
                        </Box>
                        <Database sx={{ fontSize: 30 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography color="textSecondary" gutterBottom>
                            Logging
                          </Typography>
                          <Typography variant="h6">{systemHealth.logging_status}</Typography>
                        </Box>
                        <Activity sx={{ fontSize: 30 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography color="textSecondary" gutterBottom>
                            Redis
                          </Typography>
                          <Typography variant="h6">{systemHealth.redis_status}</Typography>
                        </Box>
                        <Server sx={{ fontSize: 30 }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Maintenance Actions */}
              <Card>
                <CardHeader title="Maintenance Actions" />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Settings />}
                        onClick={() => performMaintenance('cleanup_logs')}
                        disabled={loading}
                      >
                        Cleanup Logs
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Users />}
                        onClick={() => performMaintenance('cleanup_inactive_users')}
                        disabled={loading}
                      >
                        Cleanup Inactive Users
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => performMaintenance('generate_report')}
                        disabled={loading}
                      >
                        Generate Report
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </TabPanel>
      </Box>

      {/* User Edit Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User: {selectedUser.name}</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedUser.role}
                  label="Role"
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="analyst">Analyst</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={() => updateUser(selectedUser.id, { role: selectedUser.role })}
                >
                  Save Changes
                </Button>
                <Button variant="outlined" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  )
}