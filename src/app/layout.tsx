import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UPA Estimating App - DPWH',
  description: 'Unit Price Analysis and BOQ Estimating Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-900 text-white p-4">
          <div className="container mx-auto flex items-center gap-8">
            <h1 className="text-xl font-bold">UPA Estimating</h1>
            <div className="flex gap-4 text-sm">
              <a href="/" className="hover:underline">Home</a>
              <a href="/rates" className="hover:underline">Rate Items</a>
              <a href="/labor-rates" className="hover:underline">Labor Rates</a>
              <a href="/equipment" className="hover:underline">Equipment</a>
              <a href="/estimate" className="hover:underline">Estimates</a>
              <a href="/estimate/new" className="hover:underline">New Estimate</a>
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
