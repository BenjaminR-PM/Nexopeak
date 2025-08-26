import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nexopeak - Digital Marketing Analytics',
  description: 'GA4-anchored platform with daily insights and actionable recommendations',
  authors: [{ name: 'Nexopeak Team' }],
  keywords: 'analytics, GA4, marketing, insights, SEO, digital marketing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
