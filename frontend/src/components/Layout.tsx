import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../lib/api'
import { LogOut, User } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuthStore()

  const handleLogout = () => {
    api.logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-[#eff6ff] flex flex-col">
      <nav className="bg-white shadow-sm border-b border-t-4 border-t-[#d4af37]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-4 sm:py-0 gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <img
                src="/assets/Skilscope.png"
                alt="Logo"
                className="w-10 h-10 sm:w-16 sm:h-16 object-contain"
              />
              <h1 className="text-sm sm:text-2xl font-black text-[#1e3a8a] uppercase tracking-tighter m-0 p-0 border-none whitespace-nowrap">Assessment Portal</h1>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pb-2 sm:pb-0">
              {user && (
                <>
                  <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-100">
                    <User size={12} className="text-gray-400 sm:w-[14px] sm:h-[14px]" />
                    <span className="text-[10px] sm:text-sm font-bold truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md shadow-blue-100 active:scale-95"
                  >
                    <LogOut size={14} strokeWidth={2.5} className="sm:w-[16px] sm:h-[16px]" />
                    <span className="xs:inline">Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto shadow-inner">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <img
                src="/assets/Yencode Logo.png"
                alt="Yencode Technologies Logo"
                className="h-10 sm:h-12 object-contain"
              />
              <div>
                <p className="text-[12px] sm:text-sm font-black text-[#1e3a8a] uppercase tracking-widest">Yencode Technologies</p>
                <a href="https://yencodetechnologies.com" target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-xs text-gray-400 hover:text-[#1e3a8a] transition-colors font-bold">www.yencodetechnologies.com</a>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Support</p>
              <p className="text-[11px] sm:text-sm font-bold text-gray-600">For any issues contact us: <a href="mailto:info@yencodetechnologies.com" className="text-[#1e3a8a] hover:underline block sm:inline">info@yencodetechnologies.com</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
