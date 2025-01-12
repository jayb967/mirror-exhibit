'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: 'fas fa-home' },
  { name: 'Products', href: '/admin/products', icon: 'fas fa-box' },
  { name: 'Orders', href: '/admin/orders', icon: 'fas fa-shopping-cart' },
  { name: 'Customers', href: '/admin/customers', icon: 'fas fa-users' },
  { name: 'Support', href: '/admin/support', icon: 'fas fa-headset' },
  { name: 'Marketing', href: '/admin/marketing', icon: 'fas fa-bullhorn' },
  { name: 'Settings', href: '/admin/settings', icon: 'fas fa-cog' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="h-16 flex items-center justify-center border-b">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <i className={`${item.icon} w-5 h-5 mr-3`} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}