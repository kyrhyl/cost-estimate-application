'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [masterDataOpen, setMasterDataOpen] = useState(false);
  const [workManagementOpen, setWorkManagementOpen] = useState(false);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center">
            <div className="text-xl font-bold text-blue-600">DPWH Cost Estimator</div>
          </Link>

          {/* Navigation */}
          <nav className="flex space-x-1">
            {/* Home */}
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>

            {/* Master Data Dropdown */}
            <div className="relative group">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/labor-rates') ||
                  isActive('/equipment') ||
                  isActive('/materials') ||
                  isActive('/material-prices')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Master Data ▾
              </button>
              <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  href="/labor-rates"
                  className={`block px-4 py-3 text-sm hover:bg-gray-50 first:rounded-t-lg ${
                    isActive('/labor-rates') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Labor Rates
                </Link>
                <Link
                  href="/equipment"
                  className={`block px-4 py-3 text-sm hover:bg-gray-50 ${
                    isActive('/equipment') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Equipment
                </Link>
                <Link
                  href="/materials"
                  className={`block px-4 py-3 text-sm hover:bg-gray-50 ${
                    isActive('/materials') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Materials
                </Link>
                <Link
                  href="/material-prices"
                  className={`block px-4 py-3 text-sm hover:bg-gray-50 last:rounded-b-lg ${
                    isActive('/material-prices') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Material Prices
                </Link>
              </div>
            </div>

            {/* Work Management Dropdown */}
            <div className="relative group">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/projects') ||
                  isActive('/estimate') ||
                  isActive('/dupa-templates')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Work Management ▾
              </button>
              <div className="absolute left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  href="/projects"
                  className={`block px-4 py-3 text-sm hover:bg-gray-50 first:rounded-t-lg ${
                    isActive('/projects') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  href="/estimate"
                  className={`block px-4 py-3 text-sm hover:bg-gray-50 ${
                    isActive('/estimate') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  Estimates
                </Link>
                <Link
                  href="/dupa-templates"
                  className={`block px-4 py-3 text-sm hover:bg-gray-50 last:rounded-b-lg ${
                    isActive('/dupa-templates') ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  DUPA Templates
                </Link>
              </div>
            </div>

            {/* Rates */}
            <Link
              href="/rates"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/rates')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Rates
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
