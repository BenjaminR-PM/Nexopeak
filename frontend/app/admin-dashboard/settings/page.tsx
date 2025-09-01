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
  Avatar,
  Menu,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Alert,
  Slider,
} from '@mui/material'
import {
  ArrowBack,
  Settings,
  AccountCircle,
  Logout,
  Save,
  Api,
  Security,
  Notifications,
  Analytics,
  Speed,
} from '@mui/icons-material'
import Link from 'next/link'

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
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function PlatformSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [settings, setSettings] = useState({
    // API Configuration
    ga4ApiRateLimit: 2000,
    maxConcurrentConnections: 50,
    apiTimeout: 30,
    enableApiCaching: true,
    cacheExpiryHours: 24,
    
    // Security Settings
    enableTwoFactorAuth: true,
    sessionTimeoutMinutes: 120,
    maxLoginAttempts: 5,
    enableIpWhitelisting: false,
    enableAuditLogging: true,
    
    // Platform Features
    enableTrialAccounts: true,
    trialDurationDays: 14,
    enableSelfSignup: true,
    requireEmailVerification: true,
    enableDataExport: true,
    maxDataRetentionDays: 365,
    
    // Notifications
    enableSystemAlerts: true,
    enableUsageAlerts: true,
    enableSecurityAlerts: true,
    alertThresholdPercent: 80,
    
    // Performance
    enableDataCompression: true,
    maxQueryComplexity: 100,
    enableQueryOptimization: true,
    cachingStrategy: 'aggressive'
  })

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

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = () => {
    // Here you would save settings to the backend
    console.log('Saving settings:', settings)
    // Show success message
  }

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
          <Settings sx={{ mr: 2, color: '#ef4444' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Platform Settings
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
                <Settings sx={{ fontSize: 40, color: '#dc2626', mr: 2 }} />
                <Box>
                  <Typography variant="h4" component="h1" fontWeight={700} color="#1e3a8a">
                    Platform Configuration
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Configure system-wide settings and platform behavior
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                startIcon={<Save />}
                onClick={handleSaveSettings}
                sx={{ 
                  backgroundColor: '#dc2626', 
                  '&:hover': { backgroundColor: '#b91c1c' }
                }}
              >
                Save All Changes
              </Button>
            </Box>
            <Alert severity="warning" sx={{ mt: 2 }}>
              <strong>Warning:</strong> Changes to these settings affect the entire platform and all clients. 
              Please review carefully before saving.
            </Alert>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="API & Integrations" icon={<Api />} />
              <Tab label="Security" icon={<Security />} />
              <Tab label="Platform Features" icon={<Analytics />} />
              <Tab label="Notifications" icon={<Notifications />} />
              <Tab label="Performance" icon={<Speed />} />
            </Tabs>
          </Box>

          {/* API & Integrations Tab */}
          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              API Configuration & Third-party Integrations
            </Typography>

            <Box sx={{ display: 'grid', gap: 3 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  GA4 API Rate Limiting
                </Typography>
                <TextField
                  label="Requests per hour"
                  type="number"
                  value={settings.ga4ApiRateLimit}
                  onChange={(e) => handleSettingChange('ga4ApiRateLimit', parseInt(e.target.value))}
                  size="small"
                  sx={{ mr: 2, minWidth: 200 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Maximum API requests per hour per client
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Concurrent Connections
                </Typography>
                <TextField
                  label="Max connections"
                  type="number"
                  value={settings.maxConcurrentConnections}
                  onChange={(e) => handleSettingChange('maxConcurrentConnections', parseInt(e.target.value))}
                  size="small"
                  sx={{ mr: 2, minWidth: 200 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Maximum simultaneous GA4 connections
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  API Timeout (seconds)
                </Typography>
                <Slider
                  value={settings.apiTimeout}
                  onChange={(_, value) => handleSettingChange('apiTimeout', value)}
                  min={10}
                  max={120}
                  step={5}
                  valueLabelDisplay="auto"
                  sx={{ maxWidth: 300 }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableApiCaching}
                    onChange={(e) => handleSettingChange('enableApiCaching', e.target.checked)}
                  />
                }
                label="Enable API Response Caching"
              />

              {settings.enableApiCaching && (
                <Box sx={{ ml: 4 }}>
                  <TextField
                    label="Cache expiry (hours)"
                    type="number"
                    value={settings.cacheExpiryHours}
                    onChange={(e) => handleSettingChange('cacheExpiryHours', parseInt(e.target.value))}
                    size="small"
                    sx={{ minWidth: 200 }}
                  />
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel value={activeTab} index={1}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Security & Access Control
            </Typography>

            <Box sx={{ display: 'grid', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableTwoFactorAuth}
                    onChange={(e) => handleSettingChange('enableTwoFactorAuth', e.target.checked)}
                  />
                }
                label="Require Two-Factor Authentication for Admin Accounts"
              />

              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Session Timeout (minutes)
                </Typography>
                <TextField
                  type="number"
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) => handleSettingChange('sessionTimeoutMinutes', parseInt(e.target.value))}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Maximum Login Attempts
                </Typography>
                <TextField
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableIpWhitelisting}
                    onChange={(e) => handleSettingChange('enableIpWhitelisting', e.target.checked)}
                  />
                }
                label="Enable IP Address Whitelisting"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableAuditLogging}
                    onChange={(e) => handleSettingChange('enableAuditLogging', e.target.checked)}
                  />
                }
                label="Enable Comprehensive Audit Logging"
              />
            </Box>
          </TabPanel>

          {/* Platform Features Tab */}
          <TabPanel value={activeTab} index={2}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Platform Features & Capabilities
            </Typography>

            <Box sx={{ display: 'grid', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableTrialAccounts}
                    onChange={(e) => handleSettingChange('enableTrialAccounts', e.target.checked)}
                  />
                }
                label="Allow Trial Account Creation"
              />

              {settings.enableTrialAccounts && (
                <Box sx={{ ml: 4 }}>
                  <TextField
                    label="Trial duration (days)"
                    type="number"
                    value={settings.trialDurationDays}
                    onChange={(e) => handleSettingChange('trialDurationDays', parseInt(e.target.value))}
                    size="small"
                    sx={{ minWidth: 200 }}
                  />
                </Box>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableSelfSignup}
                    onChange={(e) => handleSettingChange('enableSelfSignup', e.target.checked)}
                  />
                }
                label="Enable Self-Service Account Registration"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                  />
                }
                label="Require Email Verification for New Accounts"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableDataExport}
                    onChange={(e) => handleSettingChange('enableDataExport', e.target.checked)}
                  />
                }
                label="Allow Data Export Features"
              />

              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Data Retention Period (days)
                </Typography>
                <TextField
                  type="number"
                  value={settings.maxDataRetentionDays}
                  onChange={(e) => handleSettingChange('maxDataRetentionDays', parseInt(e.target.value))}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Maximum time to retain analytics data
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          {/* Notifications Tab */}
          <TabPanel value={activeTab} index={3}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              System Notifications & Alerts
            </Typography>

            <Box sx={{ display: 'grid', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableSystemAlerts}
                    onChange={(e) => handleSettingChange('enableSystemAlerts', e.target.checked)}
                  />
                }
                label="Enable System Status Alerts"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableUsageAlerts}
                    onChange={(e) => handleSettingChange('enableUsageAlerts', e.target.checked)}
                  />
                }
                label="Enable Usage Threshold Alerts"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableSecurityAlerts}
                    onChange={(e) => handleSettingChange('enableSecurityAlerts', e.target.checked)}
                  />
                }
                label="Enable Security Event Alerts"
              />

              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Alert Threshold ({settings.alertThresholdPercent}%)
                </Typography>
                <Slider
                  value={settings.alertThresholdPercent}
                  onChange={(_, value) => handleSettingChange('alertThresholdPercent', value)}
                  min={50}
                  max={95}
                  step={5}
                  valueLabelDisplay="auto"
                  sx={{ maxWidth: 300 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Trigger alerts when resource usage exceeds this percentage
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          {/* Performance Tab */}
          <TabPanel value={activeTab} index={4}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Performance & Optimization
            </Typography>

            <Box sx={{ display: 'grid', gap: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableDataCompression}
                    onChange={(e) => handleSettingChange('enableDataCompression', e.target.checked)}
                  />
                }
                label="Enable Data Compression"
              />

              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Maximum Query Complexity Score
                </Typography>
                <TextField
                  type="number"
                  value={settings.maxQueryComplexity}
                  onChange={(e) => handleSettingChange('maxQueryComplexity', parseInt(e.target.value))}
                  size="small"
                  sx={{ minWidth: 200 }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enableQueryOptimization}
                    onChange={(e) => handleSettingChange('enableQueryOptimization', e.target.checked)}
                  />
                }
                label="Enable Automatic Query Optimization"
              />

              <Box>
                <Typography variant="subtitle1" fontWeight={500} mb={1}>
                  Caching Strategy
                </Typography>
                <TextField
                  select
                  value={settings.cachingStrategy}
                  onChange={(e) => handleSettingChange('cachingStrategy', e.target.value)}
                  size="small"
                  sx={{ minWidth: 200 }}
                  SelectProps={{ native: true }}
                >
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="aggressive">Aggressive</option>
                </TextField>
              </Box>
            </Box>
          </TabPanel>
        </Card>
      </Box>
    </Box>
  )
}
