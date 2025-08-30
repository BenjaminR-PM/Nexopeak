import Link from 'next/link'
import { ArrowRight, BarChart3, TrendingUp, Lightbulb, Zap, Shield, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gradient">Nexopeak</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin-login" 
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200 border border-gray-300 hover:border-red-600 rounded-lg"
                title="Admin Portal"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Link>
              <Link href="/auth/login" className="btn-secondary">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Make Performance Marketing{' '}
              <span className="text-gradient">Obvious</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect GA4 and get daily, explainable recommendations that improve campaigns without needing ad-spend or CRM data. Get actionable insights in under 10 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-200">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="#features" className="btn-secondary text-lg px-8 py-3">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to optimize performance
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From daily tracking to AI-powered insights, Nexopeak gives you the data and recommendations to make better marketing decisions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center group hover:shadow-orange transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                <BarChart3 className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Daily Progress Tracking</h3>
              <p className="text-gray-600">Pull GA4 metrics daily and visualize trends vs. baseline with automated insights.</p>
            </div>

            <div className="card text-center group hover:shadow-orange transition-all duration-300">
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-success-200 transition-colors duration-200">
                <TrendingUp className="h-6 w-6 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contextual Enrichment</h3>
              <p className="text-gray-600">Fuse GA4 with Search Console, Google Trends, and demographics to explain performance.</p>
            </div>

            <div className="card text-center group hover:shadow-orange transition-all duration-300">
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-warning-200 transition-colors duration-200">
                <Lightbulb className="h-6 w-6 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Insight Engine</h3>
              <p className="text-gray-600">Generate human-readable insights with evidence and suggested next steps.</p>
            </div>

            <div className="card text-center group hover:shadow-orange transition-all duration-300">
              <div className="w-12 h-12 bg-danger-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-danger-200 transition-colors duration-200">
                <Zap className="h-6 w-6 text-danger-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Alerts</h3>
              <p className="text-gray-600">Email and Slack alerts for significant movements with actionable recommendations.</p>
            </div>

            <div className="card text-center group hover:shadow-orange transition-all duration-300">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 transition-colors duration-200">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Governed Access</h3>
              <p className="text-gray-600">Organization-level multi-user access with OAuth connections and audit trails.</p>
            </div>

            <div className="card text-center group hover:shadow-orange transition-all duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Export & Share</h3>
              <p className="text-gray-600">Export insights to CSV and share reports with stakeholders and team members.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to optimize your marketing performance?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of marketers who are already getting daily insights and improving their campaigns with data-driven decisions.
          </p>
          <Link 
            href="/auth/signup" 
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg text-lg transition-colors duration-200 transform hover:scale-105 inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Nexopeak</h3>
            <p className="mb-4">Making performance marketing obvious with data-driven insights</p>
            <p className="text-sm">© 2024 Nexopeak. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
