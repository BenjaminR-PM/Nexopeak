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
  Tooltip
} from '@mui/material'
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon
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
        (user.organization_name && user.organization_name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
                        <Tooltip title="Edit User">
                          <IconButton 
                            onClick={() => openEditDialog(user)}
                            size="small"
                            sx={{ color: '#dc2626' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
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
      </Box>
    </Box>
  )
}
