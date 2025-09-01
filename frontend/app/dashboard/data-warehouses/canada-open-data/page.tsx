'use client'

import { useState } from 'react'
import { 
  ArrowLeft, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Home,
  Globe,
  BarChart3,
  Activity,
  Calendar,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Pie } from 'recharts'

// Sample data based on Canada Open Data structure
const internetUsageByAge = [
  { ageGroup: '15-24', percentage: 98.5, users: 2450000 },
  { ageGroup: '25-34', percentage: 97.8, users: 2890000 },
  { ageGroup: '35-44', percentage: 96.2, users: 2340000 },
  { ageGroup: '45-54', percentage: 93.1, users: 2100000 },
  { ageGroup: '55-64', percentage: 87.4, users: 1980000 },
  { ageGroup: '65+', percentage: 71.2, users: 1560000 }
]

const streamingServicesByIncome = [
  { incomeQuartile: 'Lowest 25%', netflix: 45.2, amazon: 28.1, disney: 22.3, other: 15.8 },
  { incomeQuartile: 'Second 25%', netflix: 62.4, amazon: 41.2, disney: 35.7, other: 28.4 },
  { incomeQuartile: 'Third 25%', netflix: 78.9, amazon: 58.3, disney: 52.1, other: 42.6 },
  { incomeQuartile: 'Highest 25%', netflix: 89.7, amazon: 74.5, disney: 68.9, other: 58.2 }
]

const digitalAdoptionByProvince = [
  { province: 'BC', smartHome: 34.2, onlineShopping: 78.9, govServices: 65.4, socialMedia: 82.1 },
  { province: 'AB', smartHome: 31.8, onlineShopping: 76.3, govServices: 62.1, socialMedia: 79.8 },
  { province: 'SK', smartHome: 28.4, onlineShopping: 71.2, govServices: 58.7, socialMedia: 75.3 },
  { province: 'MB', smartHome: 29.1, onlineShopping: 72.8, govServices: 59.9, socialMedia: 76.8 },
  { province: 'ON', smartHome: 36.7, onlineShopping: 81.2, govServices: 68.3, socialMedia: 84.6 },
  { province: 'QC', smartHome: 32.9, onlineShopping: 75.4, govServices: 61.8, socialMedia: 80.2 },
  { province: 'NB', smartHome: 26.3, onlineShopping: 68.9, govServices: 55.2, socialMedia: 72.4 },
  { province: 'NS', smartHome: 27.8, onlineShopping: 70.1, govServices: 57.6, socialMedia: 74.1 },
  { province: 'PE', smartHome: 25.1, onlineShopping: 66.7, govServices: 53.8, socialMedia: 70.9 },
  { province: 'NL', smartHome: 24.6, onlineShopping: 65.3, govServices: 52.4, socialMedia: 69.7 }
]

const connectionTypes = [
  { name: 'High-speed broadband', value: 68.4, color: '#3B82F6' },
  { name: 'Cable', value: 45.2, color: '#10B981' },
  { name: 'DSL', value: 23.7, color: '#F59E0B' },
  { name: 'Fiber optic', value: 18.9, color: '#8B5CF6' },
  { name: 'Satellite', value: 8.3, color: '#EF4444' },
  { name: 'Mobile/Wireless', value: 12.6, color: '#06B6D4' }
]

const monthlyTrends = [
  { month: 'Jan 2024', internetUsers: 32.1, streamingUsers: 24.8, onlineShoppers: 18.9 },
  { month: 'Feb 2024', internetUsers: 32.3, streamingUsers: 25.2, onlineShoppers: 19.4 },
  { month: 'Mar 2024', internetUsers: 32.6, streamingUsers: 25.8, onlineShoppers: 20.1 },
  { month: 'Apr 2024', internetUsers: 32.8, streamingUsers: 26.1, onlineShoppers: 20.6 },
  { month: 'May 2024', internetUsers: 33.1, streamingUsers: 26.5, onlineShoppers: 21.2 },
  { month: 'Jun 2024', internetUsers: 33.4, streamingUsers: 26.9, onlineShoppers: 21.8 }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4']

interface DatasetInfo {
  id: string
  title: string
  description: string
  lastUpdated: string
  recordCount: string
  apiEndpoint: string
  downloadUrl: string
}

const availableDatasets: DatasetInfo[] = [
  {
    id: 'internet-services-age-income',
    title: 'Internet Services by Age Group and Household Income',
    description: 'Percentages of Internet users by selected services and technologies, including streaming services, smart home devices, and online shopping.',
    lastUpdated: '2024-01-15',
    recordCount: '2,450 records',
    apiEndpoint: 'https://open.canada.ca/data/api/action/datastore_search?resource_id=75e0a4a2-2bb0-4727-af1f-ff9db913171d',
    downloadUrl: 'https://open.canada.ca/data/en/dataset/75e0a4a2-2bb0-4727-af1f-ff9db913171d'
  },
  {
    id: 'internet-use-province-age',
    title: 'Internet Use by Province and Age Group',
    description: 'Percentage of Canadians personal Internet use over the past three months, segmented by province and age group.',
    lastUpdated: '2024-01-12',
    recordCount: '1,890 records',
    apiEndpoint: 'https://open.canada.ca/data/api/action/datastore_search?resource_id=419f2300-ce69-40c7-949c-ab7c2bf45258',
    downloadUrl: 'https://open.canada.ca/data/dataset/419f2300-ce69-40c7-949c-ab7c2bf45258'
  },
  {
    id: 'internet-home-connection-type',
    title: 'Internet Use at Home by Connection Type',
    description: 'Information on Internet use at home, categorized by type of connection for Canada and selected regions.',
    lastUpdated: '2024-01-10',
    recordCount: '856 records',
    apiEndpoint: 'https://open.canada.ca/data/api/action/datastore_search?resource_id=c2da1d35-8833-4b6c-8cf4-ce13d711ddfc',
    downloadUrl: 'https://open.canada.ca/data/en/dataset/c2da1d35-8833-4b6c-8cf4-ce13d711ddfc'
  }
]

export default function CanadaOpenDataDashboard() {
  const [loading, setLoading] = useState(false)
  const [selectedDataset, setSelectedDataset] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months')

  const handleRefresh = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
  }

  const handleExportData = () => {
    // Simulate data export
    const data = JSON.stringify({
      internetUsageByAge,
      streamingServicesByIncome,
      digitalAdoptionByProvince,
      connectionTypes,
      monthlyTrends
    }, null, 2)
    
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'canada-open-data-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard/data-warehouses"
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Globe className="mr-3 h-8 w-8 text-red-600" />
                Government of Canada Open Data
              </h1>
              <p className="mt-2 text-gray-600">
                Digital adoption, internet usage, and streaming habits across Canadian demographics
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="dataset-select" className="block text-sm font-medium text-gray-700 mb-2">Dataset</label>
            <select
              id="dataset-select"
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Datasets</option>
              {availableDatasets.map(dataset => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="timeframe-select" className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              id="timeframe-select"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Internet Users</p>
              <p className="text-2xl font-bold text-gray-900">33.4M</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +2.3% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Streaming Adoption</p>
              <p className="text-2xl font-bold text-gray-900">68.7%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +4.1% from last quarter
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Smart Home Devices</p>
              <p className="text-2xl font-bold text-gray-900">31.2%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +8.7% from last year
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Home className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online Shopping</p>
              <p className="text-2xl font-bold text-gray-900">74.8%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +1.9% from last month
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Internet Usage by Age Group */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Internet Usage by Age Group</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={internetUsageByAge}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ageGroup" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`${value}%`, 'Usage Rate']} />
              <Bar dataKey="percentage" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Connection Types Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Internet Connection Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={connectionTypes}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {connectionTypes.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Streaming Services by Income */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Streaming Services by Income Quartile</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={streamingServicesByIncome}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="incomeQuartile" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="netflix" stackId="a" fill="#E50914" />
              <Bar dataKey="amazon" stackId="a" fill="#FF9900" />
              <Bar dataKey="disney" stackId="a" fill="#113CCF" />
              <Bar dataKey="other" stackId="a" fill="#6B7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage Trends (Millions)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="internetUsers" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="streamingUsers" stroke="#8B5CF6" strokeWidth={2} />
              <Line type="monotone" dataKey="onlineShoppers" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provincial Digital Adoption */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Adoption by Province (%)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={digitalAdoptionByProvince} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="province" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="smartHome" fill="#3B82F6" />
            <Bar dataKey="onlineShopping" fill="#10B981" />
            <Bar dataKey="govServices" fill="#F59E0B" />
            <Bar dataKey="socialMedia" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Available Datasets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Datasets</h3>
        <div className="space-y-4">
          {availableDatasets.map((dataset) => (
            <div key={dataset.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{dataset.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{dataset.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Updated: {new Date(dataset.lastUpdated).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      {dataset.recordCount}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <a
                    href={dataset.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title="View on Open Canada"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => navigator.clipboard.writeText(dataset.apiEndpoint)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    title="Copy API endpoint"
                  >
                    <Globe className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Digital Divide by Age</h4>
            <p className="text-sm text-gray-600">
              Internet usage drops significantly after age 65 (71.2% vs 98.5% for 15-24 age group), 
              indicating opportunities for senior-focused digital literacy programs.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Income Impact on Streaming</h4>
            <p className="text-sm text-gray-600">
              Streaming service adoption nearly doubles from lowest to highest income quartiles, 
              suggesting price sensitivity in entertainment spending.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Provincial Variations</h4>
            <p className="text-sm text-gray-600">
              Ontario leads in digital adoption across most categories, while Atlantic provinces 
              show lower adoption rates, potentially due to infrastructure differences.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Growth Opportunities</h4>
            <p className="text-sm text-gray-600">
              Smart home device adoption (31.2%) has significant room for growth compared to 
              basic internet usage (89.1%), representing a key market opportunity.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
