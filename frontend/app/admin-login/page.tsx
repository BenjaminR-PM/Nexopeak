'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Shield,
  Lock,
  Email,
  AdminPanelSettings,
  ArrowBack,
} from '@mui/icons-material'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Ensure component is mounted before accessing localStorage
  useEffect(() => {
    setMounted(true)
  }, [])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Clear error when user starts typing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        // Check if user has admin role
        if (data.user.role !== 'admin') {
          setError('Access denied. Admin privileges required.')
          setIsLoading(false)
          return
        }

        // Store token and user data (only if mounted)
        if (mounted && typeof window !== 'undefined') {
          try {
            localStorage.setItem('access_token', data.access_token)
            localStorage.setItem('user', JSON.stringify(data.user))
          } catch (storageError) {
            console.error('Failed to store auth data:', storageError)
            setError('Login successful but failed to store session. Please try again.')
            setIsLoading(false)
            return
          }
        }
        
        // Redirect to admin dashboard
        router.push('/admin-dashboard')
      } else {
        setError(data.detail || 'Invalid credentials')
      }
    } catch (error) {
      console.error('Login error:', error)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Card sx={{ 
        maxWidth: 450, 
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        borderRadius: 3,
        border: '1px solid rgba(148, 163, 184, 0.1)'
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              mb: 2
            }}>
              <Box sx={{
                p: 2,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AdminPanelSettings sx={{ fontSize: 32 }} />
              </Box>
            </Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 700, 
              color: '#1e293b',
              mb: 1
            }}>
              Admin Portal
            </Typography>
            <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600, mb: 1 }}>
              Discover Your Next Marketing Peak
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Secure access to Nexopeak administration
            </Typography>
          </Box>

          {/* Back to Main Site Link */}
          <Box sx={{ mb: 3 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Button
                startIcon={<ArrowBack />}
                sx={{ 
                  color: '#64748b',
                  textTransform: 'none',
                  '&:hover': { color: '#dc2626' }
                }}
              >
                Back to Main Site
              </Button>
            </Link>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Admin Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#dc2626' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#dc2626',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#dc2626',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#dc2626',
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Admin Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#dc2626' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={isLoading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#dc2626',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#dc2626',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#dc2626',
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              startIcon={<Shield />}
              sx={{
                py: 1.5,
                mb: 3,
                background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                },
                '&:disabled': {
                  background: '#9ca3af',
                },
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
            </Button>
          </form>

          {/* Security Notice */}
          <Box sx={{ 
            mt: 4, 
            p: 2, 
            backgroundColor: '#fef2f2', 
            borderRadius: 2,
            border: '1px solid #fecaca'
          }}>
            <Typography variant="body2" sx={{ 
              color: '#7f1d1d', 
              textAlign: 'center',
              fontSize: '0.875rem'
            }}>
              <Shield sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
              This is a secure admin portal. All access attempts are logged.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
