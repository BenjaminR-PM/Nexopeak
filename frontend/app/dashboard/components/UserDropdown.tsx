'use client'

import { useState } from 'react'
import {
  Box,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
} from '@mui/material'
import {
  Person as UserIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'

interface UserDropdownProps {
  readonly userName?: string
  readonly userEmail?: string
}

export default function UserDropdown({ 
  userName = 'Demo User', 
  userEmail = 'demo@nexopeak.com' 
}: UserDropdownProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const router = useRouter()
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMenuItemClick = (path: string) => {
    handleClose()
    if (path === '/logout') {
      handleLogout()
    } else {
      router.push(path)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('demo_user')
    window.location.href = '/auth/login'
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          cursor: 'pointer',
          p: 1,
          borderRadius: 2,
          '&:hover': {
            bgcolor: '#f9fafb',
          },
        }}
        onClick={handleClick}
      >
        <Avatar sx={{ bgcolor: '#fef3c7', color: '#f97316', width: 32, height: 32 }}>
          <UserIcon />
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {userName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {userEmail}
          </Typography>
        </Box>
        <ArrowDownIcon sx={{ color: '#6b7280', fontSize: 16 }} />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            minWidth: 200,
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      >
        {/* Profile Header */}
        <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {userName}
          </Typography>
          <Typography variant="caption" sx={{ color: '#6b7280' }}>
            {userEmail}
          </Typography>
        </Box>

        {/* Profile Menu Items */}
        <MenuItem onClick={() => handleMenuItemClick('/dashboard/profile')}>
          <ListItemIcon>
            <UserIcon sx={{ fontSize: 20, color: '#6b7280' }} />
          </ListItemIcon>
          <Typography variant="body2">Profile</Typography>
        </MenuItem>

        <MenuItem onClick={() => handleMenuItemClick('/dashboard/profile?tab=settings')}>
          <ListItemIcon>
            <SettingsIcon sx={{ fontSize: 20, color: '#6b7280' }} />
          </ListItemIcon>
          <Typography variant="body2">Settings</Typography>
        </MenuItem>

        <MenuItem onClick={() => handleMenuItemClick('/dashboard/profile?tab=security')}>
          <ListItemIcon>
            <SecurityIcon sx={{ fontSize: 20, color: '#6b7280' }} />
          </ListItemIcon>
          <Typography variant="body2">Security</Typography>
        </MenuItem>

        <Divider />

        <MenuItem 
          onClick={() => handleMenuItemClick('/logout')}
          sx={{ color: '#dc2626' }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ fontSize: 20, color: '#dc2626' }} />
          </ListItemIcon>
          <Typography variant="body2" sx={{ color: '#dc2626' }}>
            Logout
          </Typography>
        </MenuItem>
      </Menu>
    </>
  )
}
