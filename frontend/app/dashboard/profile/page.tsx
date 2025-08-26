'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Avatar,
  IconButton,
  Alert,
  Chip,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Person as UserIcon,
  Email as MailIcon,
  Business as BuildingIcon,
  Security as ShieldIcon,
  Notifications as BellIcon,
  Language as GlobeIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  CameraAlt as CameraIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic'

interface TabPanelProps {
  readonly children?: React.ReactNode
  readonly index: number
  readonly value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ProfilePage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  
  const [activeTab, setActiveTab] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success')
  
  const [profileData, setProfileData] = useState({
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@nexopeak.com',
    phone: '+1 (555) 123-4567',
    title: 'Marketing Manager',
    organization: 'Demo Organization',
    industry: 'Technology',
    size: '50-100 employees',
    website: 'https://demo-org.com',
    timezone: 'America/New_York',
    language: 'English',
    currency: 'USD'
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    emailNotifications: true,
    marketingEmails: false,
    weeklyReports: true,
    dailyDigest: false
  })

  // Set tab based on URL parameter
  useEffect(() => {
    if (tabParam === 'settings') {
      setActiveTab(1)
    } else if (tabParam === 'security') {
      setActiveTab(2)
    } else {
      setActiveTab(0)
    }
  }, [tabParam])

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
    // Update URL without causing a page reload
    const url = new URL(window.location.href)
    if (newValue === 0) {
      url.searchParams.delete('tab')
    } else if (newValue === 1) {
      url.searchParams.set('tab', 'settings')
    } else if (newValue === 2) {
      url.searchParams.set('tab', 'security')
    }
    window.history.replaceState({}, '', url.toString())
  }

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    if (section === 'profile') {
      setProfileData(prev => ({ ...prev, [field]: value }))
    } else if (section === 'security') {
      setSecurityData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSave = () => {
    // API call to save profile data will be implemented
    console.log('Saving profile data:', profileData)
    setIsEditing(false)
    setAlertMessage('Profile updated successfully!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  const handlePasswordChange = () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      setAlertMessage('New passwords do not match')
      setAlertSeverity('error')
      setShowAlert(true)
      setTimeout(() => setShowAlert(false), 3000)
      return
    }
    // API call to change password will be implemented
    console.log('Changing password')
    setSecurityData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }))
    setAlertMessage('Password changed successfully!')
    setAlertSeverity('success')
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          Profile
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Manage your account settings and preferences
        </Typography>
      </Box>

      {/* Alert */}
      {showAlert && (
        <Box sx={{ mb: 3 }}>
          <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
            {alertMessage}
          </Alert>
        </Box>
      )}

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#f97316',
              },
              '& .Mui-selected': {
                color: '#f97316 !important',
              },
            }}
          >
            <Tab 
              icon={<UserIcon />} 
              label="Profile" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<SettingsIcon />} 
              label="Settings" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<ShieldIcon />} 
              label="Security" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={activeTab} index={0}>
          <CardContent>
            <Grid container spacing={3}>
              {/* Left Column - Profile Info */}
              <Grid item xs={12} lg={8}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: { xs: 'stretch', sm: 'center' }, 
                  justifyContent: 'space-between', 
                  mb: 3,
                  gap: 2
                }}>
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                    Personal Information
                  </Typography>
                  <Button
                    variant={isEditing ? "outlined" : "contained"}
                    startIcon={isEditing ? undefined : <EditIcon />}
                    onClick={() => setIsEditing(!isEditing)}
                    sx={{ 
                      alignSelf: { xs: 'flex-start', sm: 'auto' },
                      bgcolor: isEditing ? 'transparent' : '#f97316',
                      color: isEditing ? '#f97316' : 'white',
                      borderColor: isEditing ? '#f97316' : 'transparent',
                      '&:hover': {
                        bgcolor: isEditing ? '#fef3c7' : '#ea580c',
                        borderColor: isEditing ? '#ea580c' : 'transparent',
                      }
                    }}
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </Button>
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <UserIcon sx={{ mr: 1, color: '#6b7280' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <MailIcon sx={{ mr: 1, color: '#6b7280' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      value={profileData.title}
                      onChange={(e) => handleInputChange('profile', 'title', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Organization"
                      value={profileData.organization}
                      onChange={(e) => handleInputChange('profile', 'organization', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <BuildingIcon sx={{ mr: 1, color: '#6b7280' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Industry"
                      value={profileData.industry}
                      onChange={(e) => handleInputChange('profile', 'industry', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Size"
                      value={profileData.size}
                      onChange={(e) => handleInputChange('profile', 'size', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('profile', 'website', e.target.value)}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <GlobeIcon sx={{ mr: 1, color: '#6b7280' }} />,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Timezone"
                      value={profileData.timezone}
                      onChange={(e) => handleInputChange('profile', 'timezone', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Language"
                      value={profileData.language}
                      onChange={(e) => handleInputChange('profile', 'language', e.target.value)}
                      disabled={!isEditing}
                    />
                  </Grid>
                </Grid>

                {isEditing && (
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                )}
              </Grid>

              {/* Right Column - Profile Picture */}
              <Grid item xs={12} lg={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            bgcolor: '#f97316',
                            fontSize: '3rem',
                            mb: 2,
                          }}
                        >
                          <UserIcon sx={{ fontSize: '3rem' }} />
                        </Avatar>
                        <IconButton
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            bgcolor: '#f97316',
                            color: 'white',
                            '&:hover': { bgcolor: '#ea580c' },
                          }}
                        >
                          <CameraIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {profileData.firstName} {profileData.lastName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                        {profileData.title}
                      </Typography>
                      <Chip
                        label="Active"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={1}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              gap: 1
            }}>
              <BellIcon sx={{ color: '#f97316' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Notification Preferences
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securityData.emailNotifications}
                        onChange={(e) => handleInputChange('security', 'emailNotifications', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                        }}
                      />
                    }
                    label="Email Notifications"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securityData.marketingEmails}
                        onChange={(e) => handleInputChange('security', 'marketingEmails', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                        }}
                      />
                    }
                    label="Marketing Emails"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securityData.weeklyReports}
                        onChange={(e) => handleInputChange('security', 'weeklyReports', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                        }}
                      />
                    }
                    label="Weekly Reports"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securityData.dailyDigest}
                        onChange={(e) => handleInputChange('security', 'dailyDigest', e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#f97316',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#f97316',
                          },
                        }}
                      />
                    }
                    label="Daily Digest"
                  />
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                Preferences
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Timezone"
                    value={profileData.timezone}
                    onChange={(e) => handleInputChange('profile', 'timezone', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Language"
                    value={profileData.language}
                    onChange={(e) => handleInputChange('profile', 'language', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Currency"
                    value={profileData.currency}
                    onChange={(e) => handleInputChange('profile', 'currency', e.target.value)}
                  />
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={2}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              gap: 1
            }}>
              <ShieldIcon sx={{ color: '#f97316' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Security Settings
              </Typography>
            </Box>

            {/* Password Change */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                Change Password
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showPassword ? "text" : "password"}
                    value={securityData.currentPassword}
                    onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? "text" : "password"}
                    value={securityData.newPassword}
                    onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={securityData.confirmPassword}
                    onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Button
                      variant="contained"
                      onClick={handlePasswordChange}
                      disabled={!securityData.newPassword || !securityData.confirmPassword}
                      sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
                    >
                      Change Password
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Two-Factor Authentication */}
            <Box>
              <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
                Two-Factor Authentication
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Enhanced security for your account
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {securityData.twoFactorEnabled 
                      ? 'Two-factor authentication is enabled' 
                      : 'Two-factor authentication is disabled'
                    }
                  </Typography>
                </Box>
                <Switch
                  checked={securityData.twoFactorEnabled}
                  onChange={(e) => handleInputChange('security', 'twoFactorEnabled', e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#f97316',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#f97316',
                    },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </TabPanel>
      </Card>
    </Box>
  )
}