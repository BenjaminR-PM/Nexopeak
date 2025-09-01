'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart3,
  Plus,
  Target,
  TrendingUp,
  Settings,
  Users,
  LogOut,
  User,
  Menu,
  X,
  BarChart,
  PieChart,
  Activity,
  Zap,
  Globe,
  Shield,
  Database,
  Bell,
  Search
} from 'lucide-react'
import { RequireAuth } from '@/components/ProtectedRoute'
import { useSession } from '@/hooks/useSession'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const { user, logout, isAuthenticated, isLoading } = useSession()
  const router = useRouter()

  // Fetch campaigns for dropdown
  useEffect(() => {
    const fetchCampaigns = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return

      setCampaignsLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexopeak-backend-54c8631fe608.herokuapp.com'
        const response = await fetch(`${apiUrl}/api/v1/campaigns/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setCampaigns(Array.isArray(data) ? data : [])
        } else {
          console.error('Failed to fetch campaigns:', response.status)
          setCampaigns([])
        }
      } catch (error) {
        console.error('Failed to fetch campaigns:', error)
        setCampaigns([])
      } finally {
        setCampaignsLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchCampaigns()
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <Link href="/dashboard" className="text-2xl font-bold text-primary-600">
                Nexopeak
              </Link>

              {/* Campaign Dropdown */}
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  onChange={(e) => {
                    if (e.target.value) {
                      router.push(`/dashboard/campaign-analyzer?campaign=${e.target.value}`)
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    {campaignsLoading ? 'Loading campaigns...' : 'Select Campaign'}
                  </option>
                  {campaigns && campaigns.length > 0 ? campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  )) : !campaignsLoading && (
                    <option value="" disabled>No campaigns found</option>
                  )}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                <Bell className="h-5 w-5" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                  <Link
                    href="/dashboard"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <BarChart3 className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Dashboard
                  </Link>

                  <Link
                    href="/dashboard/campaigns"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Target className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Campaigns
                  </Link>

                  <Link
                    href="/dashboard/campaign-generator"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Plus className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Campaign Generator
                  </Link>

                  <Link
                    href="/dashboard/campaign-analyzer"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Target className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Campaign Analyzer
                  </Link>

                  <Link
                    href="/dashboard/connections"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Globe className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Connections
                  </Link>

                  <Link
                    href="/dashboard/data-warehouses"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <Database className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Data Warehouses
                  </Link>

                  <Link
                    href="/dashboard/reports"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <PieChart className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Reports
                  </Link>

                  <Link
                    href="/dashboard/profile"
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Profile
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </RequireAuth>
  )
}
