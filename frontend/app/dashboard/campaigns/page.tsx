'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, TextField, FormControl, InputLabel, Select, MenuItem, 
  Checkbox, Menu, Tooltip, LinearProgress, Fab
} from '@mui/material'
import {
  Add as AddIcon, ViewList as ListIcon,
  ViewModule as GridIcon, Search as SearchIcon, MoreVert as MoreIcon,
  PlayArrow as PlayIcon, Pause as PauseIcon, Edit as EditIcon,
  Delete as DeleteIcon, FileCopy as CopyIcon, Archive as ArchiveIcon,
  TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon, Analytics as AnalyticsIcon,
  Campaign as CampaignIcon, Google as GoogleIcon, Facebook as FacebookIcon,
  Instagram as InstagramIcon, LinkedIn as LinkedInIcon, Twitter as TwitterIcon,
  Email as EmailIcon, Web as WebIcon, Refresh as RefreshIcon
} from '@mui/icons-material'

export const dynamic = 'force-dynamic'

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
  target_demographics: any
  target_interests: string[]
  is_active: boolean
  created_at: string
  updated_at: string
  org_id: string
  user_id: string
  // Legacy fields for backward compatibility with mock data
  type?: string
  budget?: {
    total: number
    spent: number
    daily: number
  }
  performance?: {
    impressions: number
    clicks: number
    ctr: number
    conversions: number
    roas: number
  }
  dateRange?: {
    start: string
    end: string
  }
  lastModified?: string
  createdBy?: string
}


const statusColors = {
  active: '#4caf50',
  paused: '#ff9800',
  draft: '#2196f3',
  completed: '#9e9e9e',
  archived: '#757575'
}

const platformIcons = {
  'Google Ads': <GoogleIcon sx={{ color: '#4285f4' }} />,
  'Facebook Ads': <FacebookIcon sx={{ color: '#1877f2' }} />,
  'Instagram': <InstagramIcon sx={{ color: '#e4405f' }} />,
  'LinkedIn': <LinkedInIcon sx={{ color: '#0077b5' }} />,
  'Twitter': <TwitterIcon sx={{ color: '#1da1f2' }} />,
  'Email': <EmailIcon sx={{ color: '#34a853' }} />,
  'Website': <WebIcon sx={{ color: '#ff5722' }} />
}

// Helper functions to handle both backend and mock data structures
const getCampaignBudget = (campaign: Campaign) => {
  return {
    total: campaign.total_budget || campaign.budget?.total || 0,
    spent: campaign.budget?.spent || 0,
    daily: campaign.daily_budget || campaign.budget?.daily || 0
  }
}

const getCampaignPerformance = (campaign: Campaign) => {
  return {
    impressions: campaign.performance?.impressions || 0,
    clicks: campaign.performance?.clicks || 0,
    ctr: campaign.performance?.ctr || 0,
    conversions: campaign.performance?.conversions || 0,
    roas: campaign.performance?.roas || 0
  }
}

const getCampaignType = (campaign: Campaign) => {
  return campaign.campaign_type || campaign.type || 'Unknown'
}

const getCampaignCreatedBy = (campaign: Campaign) => {
  return campaign.createdBy || 'Unknown'
}

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('en-US').format(num)
}

const getPerformanceIcon = (roas: number) => {
  if (roas >= 3) return <TrendingUpIcon sx={{ color: '#4caf50' }} />
  if (roas >= 2) return <TrendingUpIcon sx={{ color: '#ff9800' }} />
  return <TrendingDownIcon sx={{ color: '#f44336' }} />
}

export default function CampaignsPortfolioPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Check for success message from Campaign Designer
  useEffect(() => {
    const created = searchParams.get('created')
    if (created) {
      setShowSuccessMessage(true)
      // Remove the parameter from URL without page reload
      const url = new URL(window.location.href)
      url.searchParams.delete('created')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Load campaigns
  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('access_token')
        
        if (!token) {
          // No token, show empty state
          setCampaigns([])
          setFilteredCampaigns([])
          setLoading(false)
          return
        }

        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
          
          // Add timeout to prevent hanging
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
          
          const response = await fetch(`${API_URL}/api/v1/campaigns`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
          })

          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            setCampaigns(data.campaigns || [])
            setFilteredCampaigns(data.campaigns || [])
          } else {
            // API error, show empty state
            setCampaigns([])
            setFilteredCampaigns([])
          }
        } catch (fetchError) {
          console.error('Failed to fetch campaigns:', fetchError)
          // Network error, show empty state
          setCampaigns([])
          setFilteredCampaigns([])
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error)
        setCampaigns([])
        setFilteredCampaigns([])
      } finally {
        setLoading(false)
      }
    }

    // Call the function immediately
    loadCampaigns()
  }, [])

  // Filter campaigns
  useEffect(() => {
    let filtered = campaigns

    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCampaignType(campaign).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter)
    }

    if (platformFilter !== 'all') {
      filtered = filtered.filter(campaign => campaign.platform === platformFilter)
    }

    setFilteredCampaigns(filtered)
  }, [campaigns, searchTerm, statusFilter, platformFilter])

  // Debug logging
  useEffect(() => {
    console.log('Campaigns Portfolio Debug:', {
      loading,
      campaignsCount: campaigns.length,
      filteredCount: filteredCampaigns.length,
      searchTerm,
      statusFilter,
      platformFilter
    })
  }, [loading, campaigns.length, filteredCampaigns.length, searchTerm, statusFilter, platformFilter])



  const handleStatusChange = async (campaignId: string, newStatus: Campaign['status']) => {
    try {
      // Update local state immediately
      setCampaigns(prev => prev.map(campaign =>
        campaign.id === campaignId ? { ...campaign, status: newStatus } : campaign
      ))

      // TODO: Make API call to update status
      // const response = await fetch(`${API_URL}/api/v1/campaigns/${campaignId}/status`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ status: newStatus })
      // })
    } catch (error) {
      console.error('Failed to update campaign status:', error)
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on campaigns:`, selectedCampaigns)
    // TODO: Implement bulk actions
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, campaignId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedCampaignId(campaignId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedCampaignId('')
  }

  const handleCampaignAction = (action: string) => {
    const campaign = campaigns.find(c => c.id === selectedCampaignId)
    if (!campaign) return

    switch (action) {
      case 'edit':
        router.push(`/dashboard/campaign-designer?edit=${selectedCampaignId}`)
        break
      case 'analyze':
        router.push(`/dashboard/campaign-analyzer?campaign=${selectedCampaignId}`)
        break
      case 'duplicate':
        router.push(`/dashboard/campaign-designer?duplicate=${selectedCampaignId}`)
        break
      case 'archive':
        handleStatusChange(selectedCampaignId, 'archived')
        break
      case 'delete':
        setCampaigns(prev => prev.filter(c => c.id !== selectedCampaignId))
        break
    }
    handleMenuClose()
  }

  const getPerformanceIcon = (roas: number) => {
    if (roas > 2.5) return <TrendingUpIcon sx={{ color: '#4caf50', fontSize: 16 }} />
    if (roas < 1.5) return <TrendingDownIcon sx={{ color: '#f44336', fontSize: 16 }} />
    return <RemoveIcon sx={{ color: '#ff9800', fontSize: 16 }} />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (loading && campaigns.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Campaigns Portfolio</Typography>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading campaigns...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Success Message */}
      {showSuccessMessage && (
        <Alert 
          severity="success" 
          onClose={() => setShowSuccessMessage(false)}
          sx={{ mb: 3 }}
        >
          🎉 Campaign created successfully! Your new campaign is now in your portfolio.
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Campaigns Portfolio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and monitor all your marketing campaigns
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/dashboard/campaign-designer')}
          sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
        >
          Create Campaign
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Campaigns
              </Typography>
              <Typography variant="h4">
                {campaigns.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Active Campaigns
              </Typography>
              <Typography variant="h4" sx={{ color: '#4caf50' }}>
                {campaigns.filter(c => c.status === 'active').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4">
                {formatCurrency(campaigns.reduce((sum, c) => sum + getCampaignBudget(c).total, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Total Conversions
              </Typography>
              <Typography variant="h4">
                {formatNumber(campaigns.reduce((sum, c) => sum + getCampaignPerformance(c).conversions, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <TextField
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
              }}
              sx={{ minWidth: 250 }}
            />

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="paused">Paused</MenuItem>
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            {/* Platform Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Platform</InputLabel>
              <Select
                value={platformFilter}
                label="Platform"
                onChange={(e) => setPlatformFilter(e.target.value)}
              >
                <MenuItem value="all">All Platforms</MenuItem>
                <MenuItem value="Google Ads">Google Ads</MenuItem>
                <MenuItem value="Facebook Ads">Facebook Ads</MenuItem>
                <MenuItem value="Instagram">Instagram</MenuItem>
                <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                <MenuItem value="Email">Email</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            {/* Bulk Actions */}
            {selectedCampaigns.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => handleBulkAction('activate')}
                  startIcon={<PlayIcon />}
                >
                  Activate ({selectedCampaigns.length})
                </Button>
                <Button
                  size="small"
                  onClick={() => handleBulkAction('pause')}
                  startIcon={<PauseIcon />}
                >
                  Pause ({selectedCampaigns.length})
                </Button>
              </Box>
            )}

            {/* View Mode Toggle */}
            <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <IconButton
                size="small"
                onClick={() => setViewMode('list')}
                sx={{ bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent', color: viewMode === 'list' ? 'white' : 'inherit' }}
              >
                <ListIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setViewMode('grid')}
                sx={{ bgcolor: viewMode === 'grid' ? 'primary.main' : 'transparent', color: viewMode === 'grid' ? 'white' : 'inherit' }}
              >
                <GridIcon />
              </IconButton>
            </Box>

            <IconButton onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && !loading ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No Campaigns Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {campaigns.length === 0 
                ? "You haven't created any campaigns yet. Get started by creating your first campaign!"
                : "No campaigns match your current filters. Try adjusting your search criteria."
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/campaign-designer')}
              sx={{ mr: 2 }}
            >
              Create Campaign
            </Button>
            {campaigns.length > 0 && (
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setPlatformFilter('all')
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Campaigns List/Grid */}
      {filteredCampaigns.length > 0 && viewMode === 'list' ? (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedCampaigns.length > 0 && selectedCampaigns.length < filteredCampaigns.length}
                      checked={filteredCampaigns.length > 0 && selectedCampaigns.length === filteredCampaigns.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCampaigns(filteredCampaigns.map(c => c.id))
                        } else {
                          setSelectedCampaigns([])
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Campaign</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Budget</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>ROAS</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCampaigns(prev => [...prev, campaign.id])
                          } else {
                            setSelectedCampaigns(prev => prev.filter(id => id !== campaign.id))
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: statusColors[campaign.status] }}>
                          <CampaignIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {campaign.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getCampaignType(campaign)} • Created by {getCampaignCreatedBy(campaign)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: statusColors[campaign.status],
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {platformIcons[campaign.platform as keyof typeof platformIcons]}
                        <Typography variant="body2">{campaign.platform}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(getCampaignBudget(campaign).spent)} / {formatCurrency(getCampaignBudget(campaign).total)}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getCampaignBudget(campaign).total > 0 ? (getCampaignBudget(campaign).spent / getCampaignBudget(campaign).total) * 100 : 0}
                          sx={{ mt: 0.5, height: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {formatNumber(getCampaignPerformance(campaign).clicks)} clicks
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          CTR: {getCampaignPerformance(campaign).ctr}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(getCampaignPerformance(campaign).roas)}
                        <Typography variant="body2" fontWeight="bold">
                          {getCampaignPerformance(campaign).roas.toFixed(1)}x
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={campaign.status === 'active' ? 'Pause' : 'Activate'}>
                          <IconButton
                            size="small"
                            onClick={() => handleStatusChange(
                              campaign.id,
                              campaign.status === 'active' ? 'paused' : 'active'
                            )}
                          >
                            {campaign.status === 'active' ? <PauseIcon /> : <PlayIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="More actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuClick(e, campaign.id)}
                          >
                            <MoreIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      ) : filteredCampaigns.length > 0 ? (
        <Grid container spacing={3}>
          {filteredCampaigns.map((campaign) => (
            <Grid item xs={12} sm={6} md={4} key={campaign.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: statusColors[campaign.status], width: 32, height: 32 }}>
                        <CampaignIcon fontSize="small" />
                      </Avatar>
                      <Chip
                        label={campaign.status.toUpperCase()}
                        size="small"
                        sx={{
                          bgcolor: statusColors[campaign.status],
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, campaign.id)}
                    >
                      <MoreIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {campaign.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {platformIcons[campaign.platform as keyof typeof platformIcons]}
                    <Typography variant="body2" color="text.secondary">
                      {campaign.platform} • {getCampaignType(campaign)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      Budget: {formatCurrency(getCampaignBudget(campaign).spent)} / {formatCurrency(getCampaignBudget(campaign).total)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getCampaignBudget(campaign).total > 0 ? (getCampaignBudget(campaign).spent / getCampaignBudget(campaign).total) * 100 : 0}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Clicks
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatNumber(getCampaignPerformance(campaign).clicks)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        ROAS
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(getCampaignPerformance(campaign).roas)}
                        <Typography variant="body2" fontWeight="bold">
                          {getCampaignPerformance(campaign).roas.toFixed(1)}x
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleCampaignAction('edit')}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Campaign
        </MenuItem>
        <MenuItem onClick={() => handleCampaignAction('analyze')}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          Analyze Performance
        </MenuItem>
        <MenuItem onClick={() => handleCampaignAction('duplicate')}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicate Campaign
        </MenuItem>
        <MenuItem onClick={() => handleCampaignAction('archive')}>
          <ArchiveIcon sx={{ mr: 1 }} />
          Archive Campaign
        </MenuItem>
        <MenuItem onClick={() => handleCampaignAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Campaign
        </MenuItem>
      </Menu>

      {/* Empty State */}
      {filteredCampaigns.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <CampaignIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No campaigns found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {campaigns.length === 0
                ? "Get started by creating your first marketing campaign"
                : "Try adjusting your filters to see more campaigns"
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/campaign-designer')}
              sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
            >
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add campaign"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' },
          bgcolor: '#f97316',
          '&:hover': { bgcolor: '#ea580c' }
        }}
        onClick={() => router.push('/dashboard/campaign-designer')}
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
