import Link from 'next/link'
import { ArrowLeft, Shield, Lock, Eye, Database, Users, Globe } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
              <Shield className="h-8 w-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              At Nexopeak, we are committed to protecting your privacy and ensuring the security of your data. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our 
              marketing analytics platform.
            </p>

            <div className="space-y-8">
              {/* Information We Collect */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                    <p className="text-gray-700">
                      When you create an account, we collect your name, email address, and organization details 
                      to provide you with access to our services.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Google Analytics Data</h3>
                    <p className="text-gray-700">
                      With your explicit consent, we access your Google Analytics 4 (GA4) data through secure 
                      OAuth connections to provide marketing insights and recommendations.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Data</h3>
                    <p className="text-gray-700">
                      We collect information about how you use our platform, including features accessed, 
                      reports generated, and settings configured to improve our services.
                    </p>
                  </div>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Eye className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Service Provision</h3>
                    <p className="text-gray-700">
                      We use your information to provide, maintain, and improve our marketing analytics services, 
                      including generating insights and recommendations based on your GA4 data.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Communication</h3>
                    <p className="text-gray-700">
                      We may send you important updates about our services, security notifications, and 
                      support-related communications.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics and Improvement</h3>
                    <p className="text-gray-700">
                      We analyze usage patterns to improve our platform's functionality and user experience.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Lock className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Data Security</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Encryption</h3>
                    <p className="text-gray-700">
                      All data transmitted between your browser and our servers is encrypted using industry-standard 
                      SSL/TLS protocols.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access Controls</h3>
                    <p className="text-gray-700">
                      We implement strict access controls and authentication measures to ensure only authorized 
                      personnel can access your data.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Regular Audits</h3>
                    <p className="text-gray-700">
                      We conduct regular security audits and assessments to maintain the highest standards of 
                      data protection.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data Sharing */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Data Sharing</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Third-Party Sales</h3>
                    <p className="text-gray-700">
                      We do not sell, trade, or rent your personal information to third parties for marketing purposes.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Service Providers</h3>
                    <p className="text-gray-700">
                      We may share data with trusted service providers who assist us in operating our platform, 
                      always under strict confidentiality agreements.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Legal Requirements</h3>
                    <p className="text-gray-700">
                      We may disclose information if required by law or to protect our rights, property, or safety.
                    </p>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">Your Rights</h2>
                </div>
                
                <div className="ml-13 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Access and Control</h3>
                    <p className="text-gray-700">
                      You have the right to access, update, or delete your personal information through your 
                      account settings.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Data Portability</h3>
                    <p className="text-gray-700">
                      You can export your data and insights in various formats for your own use or to transfer 
                      to other services.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Revoke Access</h3>
                    <p className="text-gray-700">
                      You can revoke our access to your Google Analytics data at any time through your 
                      Google account settings.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Email:</strong> info@nexopeak.com</p>
                  <p><strong>Address:</strong> Nexopeak Inc., Privacy Team</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
