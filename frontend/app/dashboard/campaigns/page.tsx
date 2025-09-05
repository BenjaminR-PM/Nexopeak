'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Card, CardContent, Typography, Button, Grid, Chip, Avatar, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, FormControl, InputLabel, Select, MenuItem, 
  Menu, Tooltip, LinearProgress, Divider, Stack
} from '@mui/material'
import {
  Add as AddIcon, Search as SearchIcon, MoreVert as MoreIcon,
  PlayArrow as PlayIcon, Pause as PauseIcon, Edit as EditIcon,
  Delete as DeleteIcon, Archive as ArchiveIcon,
  TrendingUp as TrendingUpIcon, Analytics as AnalyticsIcon, Campaign as CampaignIcon,
  Refresh as RefreshIcon, Facebook as FacebookIcon, Instagram as InstagramIcon, 
  LinkedIn as LinkedInIcon, Twitter as TwitterIcon,
  Google as GoogleIcon, Email as EmailIcon, Web as WebIcon,
  YouTube as YouTubeIcon, WhatsApp as WhatsAppIcon
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
}

const getChannelIcon = (channel: string) => {
  const channelLower = channel.toLowerCase()
  const iconProps = { sx: { fontSize: 20 } }
  
  if (channelLower.includes('facebook')) return <FacebookIcon {...iconProps} />
  if (channelLower.includes('instagram')) return <InstagramIcon {...iconProps} />
  if (channelLower.includes('linkedin')) return <LinkedInIcon {...iconProps} />
  if (channelLower.includes('twitter') || channelLower.includes('x.com')) return <TwitterIcon {...iconProps} />
  if (channelLower.includes('google') || channelLower.includes('search')) return <GoogleIcon {...iconProps} />
  if (channelLower.includes('youtube')) return <YouTubeIcon {...iconProps} />
  if (channelLower.includes('whatsapp')) return <WhatsAppIcon {...iconProps} />
  if (channelLower.includes('email')) return <EmailIcon {...iconProps} />
  return <WebIcon {...iconProps} />
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'paused': return 'warning'
    case 'draft': return 'default'
    case 'completed': return 'info'
    case 'archived': return 'error'
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

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  // Statistics
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.total_budget || 0), 0)
  const avgDailyBudget = campaigns.length > 0 
    ? campaigns.reduce((sum, c) => sum + (c.daily_budget || 0), 0) / campaigns.length 
    : 0

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setCampaigns([])
        setLoading(false)
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      
      const response = await fetch(`${API_URL}/api/v1/campaigns/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      } else {
        setCampaigns([])
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, campaign: Campaign) => {
    setAnchorEl(event.currentTarget)
    setSelectedCampaign(campaign)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedCampaign(null)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      
      const response = await fetch(`${API_URL}/api/v1/campaigns/${campaignId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId))
        alert('Campaign deleted successfully!')
      } else {
        alert('Failed to delete campaign')
      }
    } catch (error) {
      console.error('Error deleting campaign:', error)
      alert('Error deleting campaign')
    }
    handleMenuClose()
  }

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
      
      const response = await fetch(`${API_URL}/api/v1/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setCampaigns(prev => prev.map(c => 
          c.id === campaignId ? { ...c, status: newStatus as any } : c
        ))
        alert(`Campaign ${newStatus} successfully!`)
      } else {
        alert('Failed to update campaign status')
      }
    } catch (error) {
      console.error('Error updating campaign status:', error)
      alert('Error updating campaign status')
    }
    handleMenuClose()
  }

  const matchesSearchTerm = (campaign: Campaign, term: string) => {
    const lowerTerm = term.toLowerCase()
    return campaign.name.toLowerCase().includes(lowerTerm) ||
           campaign.description?.toLowerCase().includes(lowerTerm) ||
           campaign.primary_objective.toLowerCase().includes(lowerTerm)
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchTerm || matchesSearchTerm(campaign, searchTerm)
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Campaign Management
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
          Monitor and manage your marketing campaigns across all channels
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {totalCampaigns}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Total Campaigns
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }}>
                  <CampaignIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e7d32' }}>
                    {activeCampaigns}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Active Campaigns
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}>
                  <PlayIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f57c00' }}>
                    {formatCurrency(totalBudget)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Total Budget
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#fff3e0', color: '#f57c00' }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                    {formatCurrency(avgDailyBudget)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    Avg Daily Budget
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2' }}>
                  <AnalyticsIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search campaigns..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: '#6b7280', mr: 1 }} />
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
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

            <Box sx={{ flexGrow: 1 }} />
            
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadCampaigns}
              disabled={loading}
            >
              Refresh
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/dashboard/campaign-designer')}
              sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
            >
              Create Campaign
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Campaigns Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <LinearProgress />
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: '#6b7280' }}>
                Loading campaigns...
              </Typography>
            </Box>
          ) : filteredCampaigns.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CampaignIcon sx={{ fontSize: 64, color: '#9ca3af', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1, color: '#374151' }}>
                {campaigns.length === 0 ? 'No campaigns yet' : 'No campaigns match your filters'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                {campaigns.length === 0 
                  ? 'Create your first campaign to get started with marketing automation'
                  : 'Try adjusting your search or filter criteria'}
              </Typography>
              {campaigns.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/dashboard/campaign-designer')}
                  sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                >
                  Create Your First Campaign
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9fafb' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Campaign</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Channels</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Objective</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Budget</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {campaign.name}
                          </Typography>
                          {campaign.description && (
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              {campaign.description.length > 60 
                                ? campaign.description.substring(0, 60) + '...'
                                : campaign.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Stack direction="row" spacing={0.5}>
                          {campaign.platform && (
                            <Tooltip title={campaign.platform}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: '#f3f4f6' }}>
                                {getChannelIcon(campaign.platform)}
                              </Avatar>
                            </Tooltip>
                          )}
                          {/* Add more channels based on campaign data */}
                        </Stack>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          color={getStatusColor(campaign.status) as any}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {campaign.primary_objective}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          {campaign.total_budget && (
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatCurrency(campaign.total_budget, campaign.currency)}
                            </Typography>
                          )}
                          {campaign.daily_budget && (
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              {formatCurrency(campaign.daily_budget, campaign.currency)}/day
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          {campaign.start_date && (
                            <Typography variant="body2">
                              {formatDate(campaign.start_date)}
                            </Typography>
                          )}
                          {campaign.end_date && (
                            <Typography variant="caption" sx={{ color: '#6b7280' }}>
                              to {formatDate(campaign.end_date)}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                          {formatDate(campaign.created_at)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, campaign)}
                        >
                          <MoreIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedCampaign && handleStatusChange(selectedCampaign.id, 'active')}>
          <PlayIcon sx={{ mr: 1, fontSize: 20 }} />
          Activate
        </MenuItem>
        <MenuItem onClick={() => selectedCampaign && handleStatusChange(selectedCampaign.id, 'paused')}>
          <PauseIcon sx={{ mr: 1, fontSize: 20 }} />
          Pause
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => console.log('Edit campaign:', selectedCampaign?.id)}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => console.log('Duplicate campaign:', selectedCampaign?.id)}>
          <CampaignIcon sx={{ mr: 1, fontSize: 20 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => console.log('View analytics:', selectedCampaign?.id)}>
          <AnalyticsIcon sx={{ mr: 1, fontSize: 20 }} />
          Analytics
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => selectedCampaign && handleStatusChange(selectedCampaign.id, 'archived')}>
          <ArchiveIcon sx={{ mr: 1, fontSize: 20 }} />
          Archive
        </MenuItem>
        <MenuItem 
          onClick={() => selectedCampaign && handleDeleteCampaign(selectedCampaign.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  )
}