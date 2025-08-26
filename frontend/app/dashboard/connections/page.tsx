'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material'
import {
  Link as LinkIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ClockIcon,
  Launch as ExternalLinkIcon,
  Delete as TrashIcon,
  BarChart as BarChartIcon,
  Search as SearchIcon,
  TrendingUp as TrendingUpIcon,
  Email as MailIcon,
  CalendarToday as CalendarIcon,
  People as UsersIcon,
  Language as GlobeIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface Connection {
  id: string
  name: string
  provider: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  lastSync: string
  nextSync: string
  dataPoints: number
  icon: React.ReactNode
  description: string
}

const availableConnections = [
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    provider: 'Google',
    status: 'connected' as const,
    lastSync: '2 hours ago',
    nextSync: 'In 4 hours',
    dataPoints: 1250000,
    icon: <BarChartIcon sx={{ color: '#3b82f6' }} />,
    description: 'Website traffic, user behavior, and conversion data'
  },
  {
    id: 'gsc',
    name: 'Google Search Console',
    provider: 'Google',
    status: 'connected' as const,
    lastSync: '1 day ago',
    nextSync: 'Tomorrow',
    dataPoints: 45000,
    icon: <SearchIcon sx={{ color: '#10b981' }} />,
    description: 'Search performance, keywords, and click-through rates'
  },
  {
    id: 'gt',
    name: 'Google Trends',
    provider: 'Google',
    status: 'connected' as const,
    lastSync: '3 hours ago',
    nextSync: 'In 5 hours',
    dataPoints: 12000,
    icon: <TrendingUpIcon sx={{ color: '#ef4444' }} />,
    description: 'Search trends and seasonal patterns'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    provider: 'Intuit',
    status: 'disconnected' as const,
    lastSync: 'Never',
    nextSync: 'Not scheduled',
    dataPoints: 0,
    icon: <MailIcon sx={{ color: '#f59e0b' }} />,
    description: 'Email campaign performance and subscriber data'
  },
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    provider: 'HubSpot',
    status: 'pending' as const,
    lastSync: 'Never',
    nextSync: 'Not scheduled',
    dataPoints: 0,
    icon: <UsersIcon sx={{ color: '#f97316' }} />,
    description: 'Customer relationship and sales pipeline data'
  },
  {
    id: 'facebook',
    name: 'Facebook Ads',
    provider: 'Meta',
    status: 'error' as const,
    lastSync: 'Never',
    nextSync: 'Not scheduled',
    dataPoints: 0,
    icon: <GlobeIcon sx={{ color: '#3b82f6' }} />,
    description: 'Social media advertising performance and audience insights'
  }
]

export default function ConnectionsPage() {
  const [connections, setConnections] = useState(availableConnections)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success')
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'success'
      case 'disconnected':
        return 'default'
      case 'error':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon sx={{ color: '#10b981' }} />
      case 'disconnected':
        return <CloseIcon sx={{ color: '#6b7280' }} />
      case 'error':
        return <ErrorIcon sx={{ color: '#ef4444' }} />
      case 'pending':
        return <ClockIcon sx={{ color: '#f59e0b' }} />
      default:
        return <CloseIcon sx={{ color: '#6b7280' }} />
    }
  }

  const handleConnect = (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'connected' as const, lastSync: 'Just now', nextSync: 'In 24 hours' }
          : conn
      )
    )
    setAlertMessage('Connection established successfully!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleDisconnect = (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'disconnected' as const, lastSync: 'Never', nextSync: 'Not scheduled' }
          : conn
      )
    )
    setAlertMessage('Connection disconnected successfully!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleRefresh = (connectionId: string) => {
    setAlertMessage('Data refresh initiated!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleDelete = (connectionId: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== connectionId))
    setAlertMessage('Connection removed successfully!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Data Connections
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Connect your data sources to get comprehensive insights
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2, 
          alignItems: { xs: 'stretch', sm: 'center' } 
        }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddDialog(true)}
            sx={{ 
              bgcolor: '#f97316', 
              '&:hover': { bgcolor: '#ea580c' },
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Add New Connection
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setAlertMessage('All connections refreshed!')
              setAlertSeverity('success')
              setShowAlert(true)
              setTimeout(() => setShowAlert(false), 3000)
            }}
            sx={{ 
              borderColor: '#f97316', 
              color: '#f97316',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Refresh All
          </Button>
        </Box>
      </Box>

      {/* Alert */}
      {showAlert && (
        <Box sx={{ mb: 3 }}>
          <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        </Box>
      )}

      {/* Connections Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#10b981' }}>
                {connections.filter(c => c.status === 'connected').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Active Connections
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {connections.filter(c => c.status === 'pending').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#ef4444' }}>
                {connections.filter(c => c.status === 'error').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Errors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#6b7280' }}>
                {connections.filter(c => c.status === 'disconnected').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Disconnected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Connections Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
            All Connections
          </Typography>
          
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Connection</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Last Sync</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Next Sync</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Data Points</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#f3f4f6', width: 40, height: 40 }}>
                          {connection.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {connection.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {connection.provider}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(connection.status)}
                        <Chip
                          label={connection.status}
                          color={getStatusColor(connection.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {connection.lastSync}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {connection.nextSync}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {connection.dataPoints.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {connection.status === 'connected' ? (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleRefresh(connection.id)}
                              sx={{ color: '#f97316' }}
                            >
                              <RefreshIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDisconnect(connection.id)}
                              sx={{ color: '#6b7280' }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleConnect(connection.id)}
                            sx={{ 
                              bgcolor: '#f97316', 
                              '&:hover': { bgcolor: '#ea580c' },
                              fontSize: '0.75rem'
                            }}
                          >
                            Connect
                          </Button>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => setSelectedConnection(connection)}
                          sx={{ color: '#6b7280' }}
                        >
                          <SettingsIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(connection.id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <TrashIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Connection Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon sx={{ color: '#f97316' }} />
            Add New Connection
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Connection Type</InputLabel>
                  <Select label="Connection Type">
                    <MenuItem value="ga4">Google Analytics 4</MenuItem>
                    <MenuItem value="gsc">Google Search Console</MenuItem>
                    <MenuItem value="gt">Google Trends</MenuItem>
                    <MenuItem value="mailchimp">Mailchimp</MenuItem>
                    <MenuItem value="hubspot">HubSpot CRM</MenuItem>
                    <MenuItem value="facebook">Facebook Ads</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Connection Name"
                  placeholder="Enter a name for this connection"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Enable automatic sync"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => {
              setShowAddDialog(false)
              setAlertMessage('Connection added successfully!')
              setAlertSeverity('success')
              setShowAlert(true)
              setTimeout(() => setShowAlert(false), 3000)
            }}
            sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
          >
            Add Connection
          </Button>
        </DialogActions>
      </Dialog>

      {/* Connection Settings Dialog */}
      <Dialog 
        open={!!selectedConnection} 
        onClose={() => setSelectedConnection(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedConnection && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon sx={{ color: '#f97316' }} />
                {selectedConnection.name} Settings
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Connection Name"
                      defaultValue={selectedConnection.name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Sync Frequency</InputLabel>
                      <Select label="Sync Frequency" defaultValue="daily">
                        <MenuItem value="hourly">Hourly</MenuItem>
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable automatic sync"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Send notifications on sync failure"
                    />
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedConnection(null)}>Cancel</Button>
              <Button 
                variant="contained"
                onClick={() => {
                  setSelectedConnection(null)
                  setAlertMessage('Settings updated successfully!')
                  setAlertSeverity('success')
                  setShowAlert(true)
                  setTimeout(() => setShowAlert(false), 3000)
                }}
                sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
              >
                Save Changes
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
