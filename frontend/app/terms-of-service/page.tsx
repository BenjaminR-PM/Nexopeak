import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, Scale, Clock, Shield } from 'lucide-react'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Nexopeak
              </Link>
            </div>
            <Link 
              href="/" 
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              These Terms of Service govern your use of the Nexopeak marketing analytics platform. 
              By using our services, you agree to these terms and our Privacy Policy.
            </p>

            <div className="space-y-8">
              {/* Acceptance of Terms */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Acceptance of Terms</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <p className="text-gray-700">
                    By accessing or using Nexopeak's services, you acknowledge that you have read, 
                    understood, and agree to be bound by these Terms of Service. If you do not agree 
                    to these terms, please do not use our services.
                  </p>
                  <p className="text-gray-700">
                    These terms apply to all users of the platform, including individuals and organizations 
                    that access or use our services.
                  </p>
                </div>
              </section>

              {/* Service Description */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Service Description</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Marketing Analytics Platform</h3>
                    <p className="text-gray-700">
                      Nexopeak provides a marketing analytics platform that connects to Google Analytics 4 
                      to deliver insights, recommendations, and performance tracking for marketing campaigns.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data Integration</h3>
                    <p className="text-gray-700">
                      Our platform integrates with your existing marketing tools and data sources to provide 
                      comprehensive analytics and actionable insights.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Powered Insights</h3>
                    <p className="text-gray-700">
                      We use artificial intelligence and machine learning to analyze your data and provide 
                      personalized recommendations for campaign optimization.
                    </p>
                  </div>
                </div>
              </section>

              {/* User Accounts */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">User Accounts</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Account Creation</h3>
                    <p className="text-gray-700">
                      You must create an account to access our services. You are responsible for maintaining 
                      the confidentiality of your account credentials and for all activities that occur under your account.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Account Security</h3>
                    <p className="text-gray-700">
                      You must notify us immediately of any unauthorized use of your account or any other 
                      security breach. We are not liable for any loss or damage arising from unauthorized 
                      account access.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Account Termination</h3>
                    <p className="text-gray-700">
                      We reserve the right to terminate or suspend your account at any time for violation 
                      of these terms or for any other reason at our sole discretion.
                    </p>
                  </div>
                </div>
              </section>

              {/* Acceptable Use */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Acceptable Use</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Permitted Uses</h3>
                    <p className="text-gray-700">
                      You may use our services for legitimate business purposes related to marketing analytics 
                      and campaign optimization.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Prohibited Activities</h3>
                    <p className="text-gray-700">
                      You may not use our services to: violate any laws or regulations, infringe on intellectual 
                      property rights, transmit harmful or malicious code, or attempt to gain unauthorized access 
                      to our systems.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data Compliance</h3>
                    <p className="text-gray-700">
                      You must ensure that any data you provide or connect to our platform complies with 
                      applicable data protection laws and regulations.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data and Privacy */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Data and Privacy</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data Ownership</h3>
                    <p className="text-gray-700">
                      You retain ownership of your data. We only process your data to provide our services 
                      and in accordance with our Privacy Policy.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data Processing</h3>
                    <p className="text-gray-700">
                      By using our services, you grant us permission to process your data for the purposes 
                      of providing analytics, insights, and platform improvements.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Privacy Policy</h3>
                    <p className="text-gray-700">
                      Our collection, use, and protection of your data is governed by our Privacy Policy, 
                      which is incorporated into these terms by reference.
                    </p>
                  </div>
                </div>
              </section>

              {/* Intellectual Property */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Scale className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Intellectual Property</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Our Rights</h3>
                    <p className="text-gray-700">
                      Nexopeak and its licensors own all rights, title, and interest in and to the platform, 
                      including all software, content, and intellectual property.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your Rights</h3>
                    <p className="text-gray-700">
                      You retain ownership of your data and any content you create using our platform. 
                      You grant us a license to use your content to provide our services.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback</h3>
                    <p className="text-gray-700">
                      If you provide feedback or suggestions about our services, you grant us the right 
                      to use and incorporate such feedback without compensation.
                    </p>
                  </div>
                </div>
              </section>

              {/* Service Availability */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Service Availability</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Uptime Commitment</h3>
                    <p className="text-gray-700">
                      We strive to maintain high service availability but cannot guarantee uninterrupted 
                      access. We may perform maintenance or updates that temporarily affect service availability.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Service Updates</h3>
                    <p className="text-gray-700">
                      We may update, modify, or discontinue features of our platform at any time. 
                      We will provide reasonable notice for significant changes that affect your use of the service.
                    </p>
                  </div>
                </div>
              </section>

              {/* Limitation of Liability */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-gray-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Limitation of Liability</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Disclaimer of Warranties</h3>
                    <p className="text-gray-700">
                      Our services are provided "as is" without warranties of any kind. We disclaim all 
                      warranties, express or implied, including but not limited to merchantability and fitness for a particular purpose.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Limitation of Damages</h3>
                    <p className="text-gray-700">
                      In no event shall Nexopeak be liable for any indirect, incidental, special, or 
                      consequential damages arising out of or in connection with your use of our services.
                    </p>
                  </div>
                </div>
              </section>

              {/* Changes to Terms */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Changes to Terms</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <p className="text-gray-700">
                    We may update these Terms of Service from time to time. We will notify you of any 
                    material changes by posting the new terms on our website or through other communication channels.
                  </p>
                  <p className="text-gray-700">
                    Your continued use of our services after any changes constitutes acceptance of the new terms. 
                    If you do not agree to the new terms, you should discontinue use of our services.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> info@nexopeak.com</p>
                  <p><strong>Address:</strong> Nexopeak Inc., Legal Team</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
