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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material'
import {
  Description as FileTextIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface Report {
  id: string
  name: string
  type: 'analytics' | 'performance' | 'seo' | 'campaign'
  status: 'completed' | 'processing' | 'failed' | 'scheduled'
  createdAt: string
  lastUpdated: string
  size: string
  format: 'pdf' | 'csv' | 'excel'
  description: string
  icon: React.ReactNode
}

const mockReports: Report[] = []

export default function ReportsPage() {
  const [reports, setReports] = useState(mockReports)
  const [selectedTab, setSelectedTab] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'processing':
        return 'warning'
      case 'failed':
        return 'error'
      case 'scheduled':
        return 'info'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon sx={{ color: '#10b981' }} />
      case 'processing':
        return <ScheduleIcon sx={{ color: '#f59e0b' }} />
      case 'failed':
        return <ErrorIcon sx={{ color: '#ef4444' }} />
      case 'scheduled':
        return <ScheduleIcon sx={{ color: '#3b82f6' }} />
      default:
        return <ScheduleIcon sx={{ color: '#6b7280' }} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'analytics':
        return 'primary'
      case 'performance':
        return 'success'
      case 'seo':
        return 'warning'
      case 'campaign':
        return 'info'
      default:
        return 'default'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const handleDownload = (reportId: string) => {
    setAlertMessage('Report download started!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleShare = (reportId: string) => {
    setAlertMessage('Share link generated!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleDelete = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId))
    setAlertMessage('Report deleted successfully!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handleCreateReport = () => {
    setAlertMessage('Report creation scheduled!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
    setShowCreateDialog(false)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Reports & Analytics
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Generate, view, and manage your marketing performance reports
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
            onClick={() => setShowCreateDialog(true)}
            sx={{ 
              bgcolor: '#f97316', 
              '&:hover': { bgcolor: '#ea580c' },
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Create New Report
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            sx={{ 
              borderColor: '#f97316', 
              color: '#f97316',
              minWidth: { xs: '100%', sm: 'auto' }
            }}
          >
            Advanced Filters
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

      {/* Reports Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#10b981' }}>
                {reports.filter(r => r.status === 'completed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Completed Reports
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {reports.filter(r => r.status === 'processing').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Processing
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#ef4444' }}>
                {reports.filter(r => r.status === 'failed').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                {reports.filter(r => r.status === 'scheduled').length}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Scheduled
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#6b7280' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Report Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="analytics">Analytics</MenuItem>
                  <MenuItem value="performance">Performance</MenuItem>
                  <MenuItem value="seo">SEO</MenuItem>
                  <MenuItem value="campaign">Campaign</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
            All Reports
          </Typography>
          
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Report</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#f3f4f6', width: 40, height: 40 }}>
                          {report.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {report.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280' }}>
                            {report.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.type}
                        color={getTypeColor(report.type)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(report.status)}
                        <Chip
                          label={report.status}
                          color={getStatusColor(report.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {report.size}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {report.status === 'completed' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(report.id)}
                              sx={{ color: '#f97316' }}
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleShare(report.id)}
                              sx={{ color: '#3b82f6' }}
                            >
                              <ShareIcon />
                            </IconButton>
                          </>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => setSelectedReport(report)}
                          sx={{ color: '#6b7280' }}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(report.id)}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteIcon />
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

      {/* Create Report Dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddIcon sx={{ color: '#f97316' }} />
            Create New Report
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Report Name"
                  placeholder="Enter report name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select label="Report Type">
                    <MenuItem value="analytics">Analytics</MenuItem>
                    <MenuItem value="performance">Performance</MenuItem>
                    <MenuItem value="seo">SEO</MenuItem>
                    <MenuItem value="campaign">Campaign</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select label="Format">
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Schedule (Optional)"
                  placeholder="e.g., Weekly, Monthly"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  placeholder="Describe what this report will contain"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Include charts and graphs"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Send notification when ready"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={handleCreateReport}
            sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
          >
            Create Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Details Dialog */}
      <Dialog 
        open={!!selectedReport} 
        onClose={() => setSelectedReport(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ViewIcon sx={{ color: '#f97316' }} />
                {selectedReport.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Report Type
                    </Typography>
                    <Chip
                      label={selectedReport.type}
                      color={getTypeColor(selectedReport.type)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Status
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(selectedReport.status)}
                      <Chip
                        label={selectedReport.status}
                        color={getStatusColor(selectedReport.status)}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedReport.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedReport.lastUpdated).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Size
                    </Typography>
                    <Typography variant="body2">
                      {selectedReport.size}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Format
                    </Typography>
                    <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>
                      {selectedReport.format}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {selectedReport.description}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedReport(null)}>Close</Button>
              {selectedReport.status === 'completed' && (
                <Button 
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    handleDownload(selectedReport.id)
                    setSelectedReport(null)
                  }}
                  sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                >
                  Download
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}
