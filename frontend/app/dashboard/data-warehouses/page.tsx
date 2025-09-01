'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Database, 
  ExternalLink, 
  TrendingUp, 
  Search,
  BarChart3,
  Globe,
  ChevronRight,
  Activity,
  Calendar
} from 'lucide-react'

interface DataWarehouse {
  id: string
  name: string
  description: string
  provider: string
  category: string
  dataTypes: string[]
  status: 'active' | 'inactive' | 'coming_soon'
  lastUpdated: string
  recordCount?: string
  apiUrl?: string
  dashboardUrl: string
  icon: React.ReactNode
  features: string[]
}

const dataWarehouses: DataWarehouse[] = [
  {
    id: 'canada-open-data',
    name: 'Government of Canada Open Data',
    description: 'Comprehensive dataset including household internet usage, streaming habits, regional digital adoption rates, and demographic information.',
    provider: 'Government of Canada',
    category: 'Government',
    dataTypes: ['Demographics', 'Internet Usage', 'Digital Adoption', 'Regional Data'],
    status: 'active',
    lastUpdated: '2024-01-15',
    recordCount: '2.5M+ records',
    apiUrl: 'https://open.canada.ca',
    dashboardUrl: '/dashboard/data-warehouses/canada-open-data',
    icon: <Globe className="h-8 w-8 text-red-600" />,
    features: [
      'Household internet usage patterns',
      'Streaming service adoption rates', 
      'Regional digital divide analysis',
      'Age and income demographics',
      'Real-time data updates'
    ]
  },
  {
    id: 'statistics-canada',
    name: 'Statistics Canada (StatCan)',
    description: 'Official statistics on demographics, income distribution, spending patterns, and economic indicators across Canadian regions.',
    provider: 'Statistics Canada',
    category: 'Government',
    dataTypes: ['Demographics', 'Economics', 'Spending Patterns', 'Income Data'],
    status: 'coming_soon',
    lastUpdated: '2024-01-10',
    recordCount: '5M+ records',
    dashboardUrl: '/dashboard/data-warehouses/statistics-canada',
    icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
    features: [
      'Age and income segmentation',
      'Media spending patterns',
      'Retail consumption data',
      'Service industry metrics',
      'Regional economic indicators'
    ]
  },
  {
    id: 'google-trends',
    name: 'Google Trends API',
    description: 'Real-time search interest data for Canada, enabling comparison with GA4 data to contextualize marketing campaigns.',
    provider: 'Google',
    category: 'Search & Trends',
    dataTypes: ['Search Trends', 'Interest Data', 'Regional Trends', 'Temporal Analysis'],
    status: 'coming_soon',
    lastUpdated: '2024-01-12',
    recordCount: 'Real-time',
    apiUrl: 'https://trends.google.com',
    dashboardUrl: '/dashboard/data-warehouses/google-trends',
    icon: <TrendingUp className="h-8 w-8 text-green-600" />,
    features: [
      'Real-time search interest tracking',
      'Regional trend comparison',
      'Campaign contextualization',
      'Seasonal pattern analysis',
      'Competitive intelligence'
    ]
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  coming_soon: 'bg-yellow-100 text-yellow-800'
}

const statusLabels = {
  active: 'Active',
  inactive: 'Inactive', 
  coming_soon: 'Coming Soon'
}

export default function DataWarehousesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [filteredWarehouses, setFilteredWarehouses] = useState(dataWarehouses)

  const categories = ['all', ...Array.from(new Set(dataWarehouses.map(dw => dw.category.toLowerCase())))]

  useEffect(() => {
    let filtered = dataWarehouses

    if (searchTerm) {
      filtered = filtered.filter(dw => 
        dw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dw.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dw.dataTypes.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dw => dw.category.toLowerCase() === selectedCategory)
    }

    setFilteredWarehouses(filtered)
  }, [searchTerm, selectedCategory])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Database className="mr-3 h-8 w-8 text-primary-600" />
              Data Warehouses
            </h1>
            <p className="mt-2 text-gray-600">
              Access and analyze data from multiple external sources to enrich your marketing insights
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-primary-50 px-4 py-2 rounded-lg">
              <div className="text-sm text-primary-600 font-medium">
                {dataWarehouses.filter(dw => dw.status === 'active').length} Active Sources
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search data warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Categories</option>
            {categories.slice(1).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Warehouses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {warehouse.icon}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{warehouse.name}</h3>
                    <p className="text-sm text-gray-500">{warehouse.provider}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[warehouse.status]}`}>
                  {statusLabels[warehouse.status]}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {warehouse.description}
              </p>

              {/* Data Types */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {warehouse.dataTypes.slice(0, 3).map((type) => (
                    <span key={type} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {type}
                    </span>
                  ))}
                  {warehouse.dataTypes.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{warehouse.dataTypes.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  {warehouse.recordCount}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(warehouse.lastUpdated).toLocaleDateString()}
                </div>
              </div>

              {/* Features Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {warehouse.features.slice(0, 2).map((feature) => (
                    <li key={feature} className="flex items-center">
                      <div className="w-1 h-1 bg-primary-600 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                  {warehouse.features.length > 2 && (
                    <li className="text-primary-600">+{warehouse.features.length - 2} more features</li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <Link
                  href={warehouse.dashboardUrl}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    warehouse.status === 'active' 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {warehouse.status === 'active' ? 'View Dashboard' : 'Coming Soon'}
                  {warehouse.status === 'active' && <ChevronRight className="h-4 w-4 ml-1" />}
                </Link>
                {warehouse.apiUrl && (
                  <a
                    href={warehouse.apiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data warehouses found</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Database className="h-4 w-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900 mb-1">About Data Warehouses</h3>
            <p className="text-sm text-blue-700">
              Data warehouses provide external data sources that can be integrated with your existing analytics to provide deeper insights. 
              Each warehouse offers unique datasets that can help contextualize your marketing performance and identify new opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
